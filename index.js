// Function to render posters on the index page
function renderPosters() {
    const postersContainer = document.getElementById('postersList');
    if (!postersContainer) return;

    const posters = JSON.parse(localStorage.getItem('tourPosters')) || [];
    
    postersContainer.innerHTML = posters.map(poster => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${poster.image}" class="card-img-top" alt="${poster.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${poster.title}</h5>
                </div>
            </div>
        </div>
    `).join('');
}

// Add this to handle public poster display
function displayPublicPosters() {
    const postersContainer = document.getElementById('publicPostersList');
    if (!postersContainer) return;

    const posters = JSON.parse(localStorage.getItem('tourPosters')) || [];
    
    if (posters.length === 0) {
        postersContainer.innerHTML = '<p class="text-center text-muted">No posters available</p>';
        return;
    }

    postersContainer.innerHTML = posters
        .sort((a, b) => (a.order || 1) - (b.order || 1))
        .map(poster => `
            <div class="poster-item">
                <img src="${poster.image}" alt="${poster.title}">
                <div class="poster-content">
                    <h3 class="poster-title">${poster.title}</h3>
                    <p class="poster-description">${poster.description || ''}</p>
                </div>
            </div>
        `).join('');
}

// Poster Slider Management
const PosterSliderManager = {
    currentIndex: 0,
    currentAnimation: 'fade',
    interval: null,
    
    init() {
        this.setupEventListeners();
        this.initializeSlider();
    },

    setupEventListeners() {
        // Animation control buttons
        document.querySelectorAll('.poster-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animation = e.target.dataset.animation;
                this.changeAnimation(animation);
                
                // Update active button
                document.querySelectorAll('.poster-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Auto-pause on hover
        const slider = document.getElementById('posterSlider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseAutoplay());
            slider.addEventListener('mouseleave', () => this.startAutoplay());
        }
    },

    getPosters() {
        const stored = JSON.parse(localStorage.getItem('tourPosters')) || [];
        if (stored.length > 0) {
            return stored;
        }
        return this.defaultPosters.map(url => ({
            image: url,
            title: 'Default Poster'
        }));
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
            slide.innerHTML = `
                <img src="${poster.image}" alt="${poster.title}" loading="lazy">
                <div class="poster-content">
                    <h3>${poster.title}</h3>
                </div>
            `;
            slider.appendChild(slide);

            // Create indicator
            const dot = document.createElement('div');
            dot.className = `poster-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(dot);
        });

        this.startAutoplay();
    },

    changeAnimation(animationType) {
        this.currentAnimation = animationType;
        const slides = document.querySelectorAll('.poster-slide');
        
        slides.forEach(slide => {
            slide.className = slide.className.replace(/\w+-animation/, 
                `${animationType}-animation`);
        });
    },

    startAutoplay() {
        if (this.interval) clearInterval(this.interval);
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
        const dots = document.querySelectorAll('.poster-dot');
        
        slides[this.currentIndex].classList.remove('active');
        dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = (this.currentIndex + 1) % slides.length;
        
        slides[this.currentIndex].classList.add('active');
        dots[this.currentIndex].classList.add('active');
    },

    goToSlide(index) {
        if (index === this.currentIndex) return;
        
        const slides = document.querySelectorAll('.poster-slide');
        const dots = document.querySelectorAll('.poster-dot');
        
        slides[this.currentIndex].classList.remove('active');
        dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = index;
        
        slides[this.currentIndex].classList.add('active');
        dots[this.currentIndex].classList.add('active');
        
        // Reset autoplay
        this.startAutoplay();
    }
};

const PosterManager = {
    init() {
        this.setupPosterForm();
        this.renderPosters();
    },

    setupPosterForm() {
        const form = document.getElementById('posterForm');
        const imageInput = document.getElementById('posterImage');
        const imagePreview = document.getElementById('imagePreview');

        if (!form) return;

        // Show image preview
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.classList.remove('d-none');
                    imagePreview.querySelector('img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('posterTitle').value;
            const file = imageInput.files[0];

            if (!file) {
                alert('Please select an image');
                return;
            }

            try {
                const imageUrl = await this.readFileAsDataURL(file);
                const newPoster = {
                    id: Date.now().toString(),
                    title: title,
                    image: imageUrl,
                    date: new Date().toISOString()
                };

                // Get existing posters
                const posters = JSON.parse(localStorage.getItem('tourPosters') || '[]');
                posters.push(newPoster);

                // Save to localStorage
                localStorage.setItem('tourPosters', JSON.stringify(posters));

                // Clear form and preview
                form.reset();
                imagePreview.classList.add('d-none');
                
                // Refresh posters display
                this.renderPosters();
                
                // Trigger update event
                window.dispatchEvent(new CustomEvent('postersUpdated'));
                
                alert('Poster uploaded successfully!');
            } catch (error) {
                alert('Error uploading poster: ' + error.message);
            }
        });
    },

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },

    renderPosters() {
        const container = document.getElementById('postersList');
        if (!container) return;

        const posters = JSON.parse(localStorage.getItem('tourPosters') || '[]');
        
        if (posters.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No posters uploaded yet</p>';
            return;
        }

        container.innerHTML = posters.map(poster => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <img src="${poster.image}" class="card-img-top" alt="${poster.title}">
                    <div class="card-body">
                        <h5 class="card-title">${poster.title}</h5>
                        <button class="btn btn-danger btn-sm" 
                                onclick="PosterManager.deletePoster('${poster.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    deletePoster(id) {
        if (!confirm('Are you sure you want to delete this poster?')) return;

        const posters = JSON.parse(localStorage.getItem('tourPosters') || '[]');
        const updatedPosters = posters.filter(poster => poster.id !== id);
        localStorage.setItem('tourPosters', JSON.stringify(updatedPosters));
        
        this.renderPosters();
        window.dispatchEvent(new CustomEvent('postersUpdated'));
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderPosters();
    displayPublicPosters();
    
    // Listen for poster updates
    window.addEventListener('storage', (e) => {
        if (e.key === 'tourPosters') {
            displayPublicPosters();
        }
    });

    PosterSliderManager.init();
    PosterManager.init();
});
