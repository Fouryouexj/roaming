// Poster Slider Management System
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
    },

    setupEventListeners() {
        // Listen for poster updates from admin
        window.addEventListener('storage', (e) => {
            if (e.key === 'tourPosters' || e.key === 'tourPosterUrls') {
                this.initializeSlider();
            }
        });

        // Setup animation controls
        document.querySelectorAll('.poster-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animation = e.target.dataset.animation;
                this.changeAnimation(animation);
                
                // Update active button
                document.querySelectorAll('.poster-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    getPosters() {
        const stored = JSON.parse(localStorage.getItem('tourPosters'));
        if (stored && stored.length > 0) {
            return stored.map(p => p.image);
        }
        return this.defaultPosters;
    },

    initializeSlider() {
        const slider = document.getElementById('posterSlider');
        const indicators = document.getElementById('posterIndicators');
        
        if (!slider || !indicators) return;

        this.clearSlider();
        
        const posters = this.getPosters();
        
        // Create slides
        posters.forEach((poster, index) => {
            const slide = document.createElement('div');
            slide.className = `poster-slide ${this.currentAnimation}-animation ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `<img src="${poster}" alt="Tour Poster ${index + 1}" loading="lazy">`;
            slider.appendChild(slide);

            // Create indicators
            const indicator = document.createElement('div');
            indicator.className = `poster-dot ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => this.goToSlide(index);
            indicators.appendChild(indicator);
        });

        this.startAutoplay();
    },

    clearSlider() {
        const slider = document.getElementById('posterSlider');
        const indicators = document.getElementById('posterIndicators');
        
        if (slider) slider.innerHTML = '';
        if (indicators) indicators.innerHTML = '';
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    startAutoplay() {
        this.interval = setInterval(() => this.nextSlide(), 4000);
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

    goToSlide(index) {
        const slides = document.querySelectorAll('.poster-slide');
        const indicators = document.querySelectorAll('.poster-dot');

        slides[this.currentIndex].classList.remove('active');
        indicators[this.currentIndex].classList.remove('active');

        this.currentIndex = index;

        slides[this.currentIndex].classList.add('active');
        indicators[this.currentIndex].classList.add('active');

        // Reset autoplay
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.startAutoplay();
    },

    changeAnimation(animationType) {
        this.currentAnimation = animationType;
        const slides = document.querySelectorAll('.poster-slide');
        
        slides.forEach(slide => {
            slide.className = slide.className.replace(/\w+-animation/, `${animationType}-animation`);
        });
    }
};

// Initialize poster slider
document.addEventListener('DOMContentLoaded', () => {
    PosterSliderManager.init();
});
