
// ======================
// Shared Configuration
// ======================
const CONFIG = {
    localStorageKeys: {
        pending: 'pendingReviews',
        approved: 'approvedReviews',
        auth: 'adminAuth'
    },
    security: {
        password: 'SecurePass123!', // Change for production
        sessionTimeout: 3600000 // 1 hour
    },
    swiperConfig: {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    }
};

// ======================
// Data Service
// ======================

const DataService = {
    async getPending() {
        const res = await fetch('/api/reviews?status=pending');
        if (!res.ok) return [];
        return await res.json();
    },

    async getApproved() {
        const res = await fetch('/api/reviews?status=approved');
        if (!res.ok) return [];
        return await res.json();
    },

    async savePending(reviews) {
        const res = await fetch('/api/reviews/pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviews)
        });
        if (!res.ok) throw new Error('Failed to save pending reviews');
        return await res.json();
    },

    async saveApproved(reviews) {
        const res = await fetch('/api/reviews/approved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviews)
        });
        if (!res.ok) throw new Error('Failed to save approved reviews');
        return await res.json();
    },

    async addReview(review) {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
        if (!res.ok) throw new Error('Failed to submit review');
        return await res.json();
    }
};

// ======================
// Review UI Components
// ======================

const ReviewUI = {
    createReviewElement(review, isAdmin = false) {
        const element = document.createElement('div');
        element.className = 'review-card';
        element.dataset.id = review.id;
        
        // Modified HTML structure to always include the reviewer's name
        element.innerHTML = `
            <div class="review-meta">
                <span class="reviewer-name">${review.name}</span>
                ${isAdmin ? `<span class="review-date">${new Date(review.date).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <p>${review.text}</p>
            ${isAdmin ? `
            <div class="review-actions">
                <button class="action-btn approve-btn">Approve</button>
                <button class="action-btn reject-btn">Reject</button>
            </div>` : ''}
        `;

        if(isAdmin) {
            element.querySelector('.approve-btn').addEventListener('click', () => 
                AdminActions.approve(review.id)
            );
            element.querySelector('.reject-btn').addEventListener('click', () => 
                AdminActions.reject(review.id)
            );
        }

        return element;
    },

   async renderPending(containerId = 'reviews-list') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const pending = await DataService.getPending();
        pending.forEach(review => {
            container.appendChild(this.createReviewElement(review, true));
        });
    },

    async updateCarousel(swiperInstance) {
        swiperInstance.removeAllSlides();
        const approved = await DataService.getApproved();
        approved.forEach(review => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.appendChild(this.createReviewElement(review));
            swiperInstance.appendSlide(slide);
        });
        swiperInstance.update();
    }
};

// ======================
// Public Page Controller
// ======================
const PublicController = {
    swiper: null,
    rating: 0,

    initialize() {
        this.initSwiper();
        this.initRating();
        this.handleForm();
    },

    initSwiper() {
        this.swiper = new Swiper('.swiper-container', CONFIG.swiperConfig);
        ReviewUI.updateCarousel(this.swiper);
    },

    initRating() {
        const stars = document.querySelectorAll('.rating-star');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.rating = index + 1;
                stars.forEach((s, i) => 
                    s.classList.toggle('active', i <= index)
                );
            });
        });
    },

     handleForm() {
        const form = document.getElementById('reviewForm');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const review = {
                name: formData.get('name'),
                email: formData.get('email'),
                rating: this.rating,
                text: formData.get('review'),
                date: new Date().toISOString()
            };

            if (!this.validateReview(review)) return;

            try {
                await DataService.addReview(review);
                this.resetForm(form);
                showToast('Review submitted for approval!', 'success');
            } catch (err) {
                showToast('Failed to submit review', 'error');
            }
        });
    },

  validateReview(review) {
        if (!review.rating) {
            showToast('Please select a rating!', 'error');
            return false;
        }
        if (!review.name || !review.name.trim() || !review.text || !review.text.trim()) {
            showToast('Please fill all required fields!', 'error');
            return false;
        }
        return true;
    },

    resetForm(form) {
        form.reset();
        this.rating = 0;
        document.querySelectorAll('.rating-star').forEach(star => 
            star.classList.remove('active')
        );
    }
};

// ======================
// Admin Controller
// ======================
const AdminController = {
    swiper: null,

    initialize() {
        AuthService.verifySession();
        this.initUI();
        this.initSwiper();
        this.setupLogout();
    },

    initUI() {
        ReviewUI.renderPending();
        document.getElementById('pending-count').textContent = 
            DataService.getPending().length;
        document.getElementById('approved-count').textContent = 
            DataService.getApproved().length;
    },

    initSwiper() {
        this.swiper = new Swiper('.swiper-container', CONFIG.swiperConfig);
        ReviewUI.updateCarousel(this.swiper);
    },

    setupLogout() {
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                localStorage.removeItem(CONFIG.localStorageKeys.auth);
                window.location.href = '/';
            });
        });
    }
};

// ======================
// Admin Actions
// ======================
const AdminActions = {
    approve(id) {
        const pending = DataService.getPending();
        const approved = DataService.getApproved();
        const index = pending.findIndex(r => r.id === id);

        if (index === -1) return;

        const [review] = pending.splice(index, 1);
        review.approvedDate = new Date().toISOString();
        approved.push(review);

        DataService.savePending(pending);
        DataService.saveApproved(approved);
        
        AdminController.initUI();
        ReviewUI.updateCarousel(AdminController.swiper);
        showToast('Review approved successfully!', 'success');
    },

    reject(id) {
        const pending = DataService.getPending().filter(r => r.id !== id);
        DataService.savePending(pending);
        AdminController.initUI();
        showToast('Review rejected successfully!', 'error');
    }
};

// ======================
// Auth Service
// ======================
const AuthService = {
    verifySession() {
        if (!this.isAdminRoute()) return;
        
        const authTime = parseInt(localStorage.getItem('authTime'));
        const isExpired = Date.now() - authTime > CONFIG.security.sessionTimeout;
        
        if (!localStorage.getItem(CONFIG.localStorageKeys.auth) || isExpired) {
            localStorage.removeItem(CONFIG.localStorageKeys.auth);
            window.location.href = 'login.html';
        }
    },

    authenticate(password) {
        if (password === CONFIG.security.password) {
            localStorage.setItem(CONFIG.localStorageKeys.auth, 'true');
            localStorage.setItem('authTime', Date.now());
            window.location.href = 'admin.html';
            return true;
        }
        showToast('Invalid credentials!', 'error');
        return false;
    },

    isAdminRoute() {
        return window.location.pathname.includes('admin.html');
    }
};

// ======================
// Notification System
// ======================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ======================
// Initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reviewForm')) {
        PublicController.initialize();
    }
    
    if (document.getElementById('admin-panel')) {
        AdminController.initialize();
    }
});

// Login Page Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        AuthService.authenticate(password);
    });
}