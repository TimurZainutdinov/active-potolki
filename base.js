/**
 * Slider Module
 * Production-ready vanilla JS slider with accessibility
 */
class Slider {
    constructor(selector, options = {}) {
        this.slider = document.querySelector(selector);
        if (!this.slider) return;
        
        this.track = this.slider.querySelector('#sliderTrack');
        this.slides = Array.from(this.track.children);
        this.prevBtn = this.slider.querySelector('#prevBtn');
        this.nextBtn = this.slider.querySelector('#nextBtn');
        this.dotsContainer = this.slider.querySelector('#sliderDots');
        
        this.currentIndex = 0;
        this.autoplayInterval = null;
        
        this.config = {
            autoplay: true,
            autoplayDelay: 5000,
            pauseOnHover: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createDots();
        this.bindEvents();
        this.startAutoplay();
        this.updateSlider();
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `slider__dot${index === 0 ? ' slider__dot--active' : ''}`;
            dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        
        this.dots = Array.from(this.dotsContainer.children);
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Pause on hover
        if (this.config.pauseOnHover) {
            this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
            this.slider.addEventListener('mouseleave', () => this.startAutoplay());
        }
        
        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    handleSwipe(start, end) {
        const swipeThreshold = 5000;
        const diff = start - end;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }
    
    updateSlider() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('slider__slide--active', index === this.currentIndex);
        });
        
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('slider__dot--active', index === this.currentIndex);
            });
        }
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetAutoplay();
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider();
        this.resetAutoplay();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
        this.resetAutoplay();
    }
    
    startAutoplay() {
        if (!this.config.autoplay) return;
        
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.config.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
}

/**
 * Lazy Loading Images
 * Performance optimization
 */
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );
            
            this.images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback for older browsers
            this.images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    }
    
    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize slider
    const slider = new Slider('#heroSlider', {
        autoplay: true,
        autoplayDelay: 20000,
        pauseOnHover: true
    });
    
    // Initialize lazy loading
    const lazyLoader = new LazyLoader();
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
    
    // Console info (remove in production)
    console.log('%cЮра Потолки', 'font-size: 20px; font-weight: bold; color: #60a5fa;');
    console.log('%cSite loaded successfully', 'color: #9ca3af;');
});

/**
 * Error handling
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
}, true);

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

/**
 * Lightbox Gallery
 */
class Lightbox {
    constructor(sliderSelector) {
        this.slider = document.querySelector(sliderSelector);
        if (!this.slider) return;
        
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxClose = document.getElementById('lightboxClose');
        this.lightboxPrev = document.getElementById('lightboxPrev');
        this.lightboxNext = document.getElementById('lightboxNext');
        this.lightboxCounter = document.getElementById('lightboxCounter');
        
        this.slides = Array.from(this.slider.querySelectorAll('.slider__slide'));
        this.currentIndex = 0;
        this.images = this.slides.map(slide => {
            const img = slide.querySelector('img');
            return {
                src: img.src,
                alt: img.alt
            };
        });
        
        // Свойства для свайпа
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        // Add click to all slider images
        this.slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.addEventListener('click', () => this.open(index));
            }
        });
        
        // Close button
        this.lightboxClose.addEventListener('click', () => this.close());
        
        // Navigation
        this.lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prev();
        });
        
        this.lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            this.next();
        });
        
        // Click on background
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox || e.target.classList.contains('lightbox__content')) {
                this.close();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // ✅ Touch swipe support (исправлено)
        this.lightbox.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.lightbox.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    // ✅ Вынесено как отдельный метод класса
    handleSwipe() {
        const threshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next(); // Свайп влево → следующее
            } else {
                this.prev(); // Свайп вправо → предыдущее
            }
        }
    }
    
    open(index) {
        this.currentIndex = index;
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    updateImage() {
        const image = this.images[this.currentIndex];
        this.lightboxImage.src = image.src;
        this.lightboxImage.alt = image.alt;
        this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }
}

// Initialize lightbox after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = new Lightbox('#heroSlider');
});

// Modal window

document.addEventListener('DOMContentLoaded', () => {
    const tags = document.querySelectorAll('.hero__tag');
    const modal = document.getElementById('info-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.modal-close');

    // Функция для получения ширины скроллбара
    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function openModal(targetId) {
        const contentBlock = document.getElementById(targetId);
        
        if (contentBlock) {
            const scrollbarWidth = getScrollbarWidth();
            
            // Компенсируем ширину скролла отступом, чтобы контент не прыгал
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            modalBody.innerHTML = contentBlock.innerHTML;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Убираем компенсационный отступ
        document.body.style.paddingRight = '';
        
        setTimeout(() => { modalBody.innerHTML = ''; }, 300);
    }

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const targetId = tag.getAttribute('data-target');
            if (targetId) openModal(targetId);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});