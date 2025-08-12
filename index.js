// Remove duplicate PosterManager - it's already properly implemented in admin.js
// This file will focus on frontend poster display functionality

const PosterSliderManager = {
    currentIndex: 0,
    currentAnimation: 'fade',
    interval: null,
    defaultPosters: [
        'imgg/MAASAI MARA 4.jpg',
        'imgg/COAST 2.jpg',
        'imgg/HIDDEN GEM 2.jpg',
        'imgg/FIRE PLACE 2.jpg',
        'imgg/AMBOSELI NATIONAL PARK.jpg'
    ],

    init() {
        this.setupEventListeners();
        this.initializeSlider();
        this.setupAnimationControls();
    },

    setupEventListeners() {
        // Listen for poster updates from admin
        window.addEventListener('postersUpdated', () => {
            this.initializeSlider();
        });

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'tourPosters') {
                this.initializeSlider();
            }
        });

        // Setup touch/swipe support for mobile
        this.setupTouchControls();
    },

    setupAnimationControls() {
        // Create animation control buttons if they don't exist
        const controlsContainer = document.querySelector('.poster-controls');
        if (controlsContainer && !document.querySelector('.animation-controls')) {
            const animationControls = document.createElement('div');
            animationControls.className = 'animation-controls';
            animationControls.innerHTML = `
                <button class="poster-btn active" data-animation="fade">Fade</button>
                <button class="poster-btn" data-animation="slide">Slide</button>
                <button class="poster-btn" data-animation="zoom">Zoom</button>
                <button class="poster-btn" data-animation="flip">Flip</button>
            `;
            controlsContainer.appendChild(animationControls);
        }

        // Setup animation controls
        document.querySelectorAll('.poster-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animation = e.target.dataset.animation;
                if (animation) {
                    this.changeAnimation(animation);

                    // Update active button
                    document.querySelectorAll('.poster-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    },

    setupTouchControls() {
        const slider = document.getElementById('posterSlider');
        if (!slider) return;

        let startX = 0;
        let startY = 0;
        let isDragging = false;

        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.pauseAutoplay();
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        slider.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }

            this.startAutoplay();
        });
    },

    getPosters() {
        const stored = JSON.parse(localStorage.getItem('tourPosters'));
        if (stored && stored.length > 0) {
            return stored.map(p => ({
                image: p.image,
                title: p.title,
                description: p.description || ''
            }));
        }
        return this.defaultPosters.map((img, index) => ({
            image: img,
            title: `Destination ${index + 1}`,
            description: 'Explore amazing destinations with us'
        }));
    },

    initializeSlider() {
        const slider = document.getElementById('posterSlider');
        const indicators = document.getElementById('posterIndicators');

        if (!slider || !indicators) return;

        this.clearSlider();

        const posters = this.getPosters();

        // Create slides with enhanced content
        posters.forEach((poster, index) => {
            const slide = document.createElement('div');
            slide.className = `poster-slide ${this.currentAnimation}-animation ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img src="${poster.image}" alt="${poster.title}" loading="lazy">
                <div class="poster-content">
                    <h3>${poster.title}</h3>
                    ${poster.description ? `<p>${poster.description}</p>` : ''}
                </div>
            `;
            slider.appendChild(slide);

            // Create indicators
            const indicator = document.createElement('div');
            indicator.className = `poster-dot ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => this.goToSlide(index);
            indicators.appendChild(indicator);
        });

        // Add controls if they don't exist
        this.addControls(slider);
        this.startAutoplay();
    },

    addControls(slider) {
        if (slider.querySelector('.poster-controls')) return;

        const controls = document.createElement('div');
        controls.className = 'poster-controls';
        controls.innerHTML = `
            <div class="poster-indicators" id="posterIndicators"></div>
        `;
        slider.appendChild(controls);
    },

    clearSlider() {
        const slider = document.getElementById('posterSlider');
        const indicators = document.getElementById('posterIndicators');

        if (slider) {
            // Keep controls, remove only slides
            const slides = slider.querySelectorAll('.poster-slide');
            slides.forEach(slide => slide.remove());
        }
        if (indicators) indicators.innerHTML = '';

        this.pauseAutoplay();
    },

    startAutoplay() {
        this.pauseAutoplay();
        this.interval = setInterval(() => this.nextSlide(), 5000);
    },

    pauseAutoplay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    nextSlide() {
        const slides = document.querySelectorAll('.poster-slide');
        const indicators = document.querySelectorAll('.poster-dot');

        if (slides.length === 0) return;

        slides[this.currentIndex].classList.remove('active');
        indicators[this.currentIndex].classList.remove('active');

        this.currentIndex = (this.currentIndex + 1) % slides.length;

        slides[this.currentIndex].classList.add('active');
        indicators[this.currentIndex].classList.add('active');
    },

    prevSlide() {
        const slides = document.querySelectorAll('.poster-slide');
        const indicators = document.querySelectorAll('.poster-dot');

        if (slides.length === 0) return;

        slides[this.currentIndex].classList.remove('active');
        indicators[this.currentIndex].classList.remove('active');

        this.currentIndex = this.currentIndex === 0 ? slides.length - 1 : this.currentIndex - 1;

        slides[this.currentIndex].classList.add('active');
        indicators[this.currentIndex].classList.add('active');
    },

    goToSlide(index) {
        const slides = document.querySelectorAll('.poster-slide');
        const indicators = document.querySelectorAll('.poster-dot');

        if (slides.length === 0 || index === this.currentIndex) return;

        slides[this.currentIndex].classList.remove('active');
        indicators[this.currentIndex].classList.remove('active');

        this.currentIndex = index;

        slides[this.currentIndex].classList.add('active');
        indicators[this.currentIndex].classList.add('active');

        // Reset autoplay
        this.startAutoplay();
    },

    changeAnimation(animationType) {
        this.currentAnimation = animationType;
        const slides = document.querySelectorAll('.poster-slide');

        slides.forEach(slide => {
            slide.className = slide.className.replace(/\w+-animation/, `${animationType}-animation`);
        });

        // Add special handling for new animation types
        if (animationType === 'flip') {
            slides.forEach(slide => {
                slide.style.transformStyle = 'preserve-3d';
            });
        }
    }
};

// Enhanced initialization for PosterSliderManager
document.addEventListener('DOMContentLoaded', () => {
    // Initialize poster slider with animation
    PosterSliderManager.init();

    // Add intersection observer for animation
    const posterContainer = document.querySelector('.poster-container');
    if (posterContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        observer.observe(posterContainer);
    }
});

const PosterService = {
    async getAll() {
        const res = await fetch('/api/posters');
        if (!res.ok) return [];
        return await res.json();
    },
    async add(poster) {
        const res = await fetch('/api/posters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(poster)
        });
        if (!res.ok) throw new Error('Failed to submit poster');
        return await res.json();
    }
};

// Handle poster updates from admin
window.addEventListener('postersUpdated', () => {
    PosterSliderManager.initializeSlider();
});
