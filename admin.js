// admin.js - Handles booking data for admin panel and booking forms

// Utility: Save booking to localStorage
function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Utility: Get all bookings
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Function to get passenger statistics
function getPassengerStats() {
    const bookings = getBookings();
    const stats = {
        totalPassengers: 0,
        totalAdults: 0,
        totalKids: 0,
        kidAges: [],
        freeKids: 0,
        totalBookings: bookings.length
    };

    bookings.forEach(booking => {
        // Add to total passengers
        stats.totalPassengers += parseInt(booking.totalPassengers) || 0;

        // Count adults and kids
        if (booking.numAdults) {
            stats.totalAdults += parseInt(booking.numAdults);
        } else if (booking.passengerType !== 'Kid') {
            // Legacy data without numAdults field
            stats.totalAdults += parseInt(booking.totalPassengers) || 0;
        }

        if (booking.numKids) {
            stats.totalKids += parseInt(booking.numKids);

            // Count free kids
            if (booking.freeKidsCount) {
                stats.freeKids += parseInt(booking.freeKidsCount);
            } else if (booking.isFreeTravel) {
                stats.freeKids += parseInt(booking.numKids);
            }

            // Add kid age to array (if available)
            if (booking.passengerAge) {
                const age = parseInt(booking.passengerAge);
                // Add the age multiple times based on numKids
                for (let i = 0; i < booking.numKids; i++) {
                    stats.kidAges.push(age);
                }
            }
        } else if (booking.passengerType === 'Kid') {
            // Legacy data without numKids field
            stats.totalKids += parseInt(booking.totalPassengers) || 0;

            if (booking.isFreeTravel) {
                stats.freeKids += parseInt(booking.totalPassengers) || 0;
            }

            if (booking.passengerAge) {
                const age = parseInt(booking.passengerAge);
                stats.kidAges.push(age);
            }
        }
    });

    return stats;
}

// For admin panel: Render bookings (modern UI)
function renderBookings() {
    const tableBody = document.getElementById('booking-table-body');
    const emptyMsg = document.getElementById('empty-message');

    if (!tableBody) return;

    const bookings = getBookings();
    const stats = getPassengerStats();

    // Update passenger statistics display
    updatePassengerStats(stats);

    tableBody.innerHTML = '';

    if (bookings.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                    No bookings found
                </td>
            </tr>
        `;
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    bookings.forEach((booking, index) => {
        // Create enhanced passenger info
        let passengerInfo = '';

        // Display total passengers
        passengerInfo += `<div><strong>Total:</strong> ${booking.totalPassengers || 'N/A'}</div>`;

        // Display adults and kids count
        if (booking.numAdults !== undefined) {
            passengerInfo += `<div><strong>Adults:</strong> ${booking.numAdults}</div>`;
        }

        if (booking.numKids !== undefined && booking.numKids > 0) {
            passengerInfo += `<div><strong>Kids:</strong> ${booking.numKids}`;
            
            // Add age info if available
            if (booking.passengerAge) {
                passengerInfo += ` (${booking.passengerAge} yrs)`;
            }

            // Add free travel badge if applicable
            if (booking.isFreeTravel || booking.freeKidsCount > 0) {
                passengerInfo += ` <span class="badge bg-success">Free Travel</span>`;
            }

            passengerInfo += `</div>`;
        } else if (booking.passengerType === 'Kid') {
            // Legacy data handling
            passengerInfo += `<div><strong>Kids:</strong> ${booking.totalPassengers || 'N/A'}`;
            
            if (booking.passengerAge) {
                passengerInfo += ` (${booking.passengerAge} yrs)`;
            }

            if (booking.isFreeTravel) {
                passengerInfo += ` <span class="badge bg-success">Free Travel</span>`;
            }

            passengerInfo += `</div>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${booking.name || 'N/A'}</td>
            <td>${booking.email || 'N/A'}</td>
            <td>${booking.phone || 'N/A'}</td>
            <td>${booking.destination || 'N/A'}</td>
            <td>${booking.travelDate || 'N/A'}</td>
            <td>${passengerInfo}</td>
            <td><span class="badge bg-warning">Pending</span></td>
            <td>${booking.submittedAt ? new Date(booking.submittedAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-details" data-booking-id="${index}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add event listeners for view details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            showBookingDetails(bookings[bookingId]);
        });
    });
}

// Function to show booking details in a modal
function showBookingDetails(booking) {
    // Check if modal exists, create if not
    let modal = document.getElementById('booking-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'booking-details-modal';
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Booking Details</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="booking-details-content">
                        <!-- Content will be inserted here -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Populate modal content
    const modalContent = document.getElementById('booking-details-content');

    let fareInfo = '';
    if (booking.passengerType === 'Kid') {
        if (booking.isFreeTravel || (booking.passengerAge && parseInt(booking.passengerAge) < 3)) {
            fareInfo = `<div class="alert alert-success">Kids under 3 travel free</div>`;
        } else {
            fareInfo = `<div class="alert alert-info">Normal kid fare applies</div>`;
        }
    }

    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Contact Information</h6>
                <p><strong>Name:</strong> ${booking.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${booking.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
            </div>
            <div class="col-md-6">
                <h6>Trip Details</h6>
                <p><strong>Destination:</strong> ${booking.destination || 'N/A'}</p>
                <p><strong>Travel Date:</strong> ${booking.travelDate || 'N/A'}</p>
                <p><strong>Submitted:</strong> ${booking.submittedAt ? new Date(booking.submittedAt).toLocaleString() : 'N/A'}</p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h6>Passenger Information</h6>
                <p><strong>Total Passengers:</strong> ${booking.totalPassengers || 'N/A'}</p>
                <p><strong>Adults:</strong> ${booking.numAdults !== undefined ? booking.numAdults : 'N/A'}</p>
                <p><strong>Kids:</strong> ${booking.numKids !== undefined ? booking.numKids : (booking.passengerType === 'Kid' ? booking.totalPassengers : '0')}</p>
                ${booking.passengerAge ? `<p><strong>Kid Age:</strong> ${booking.passengerAge} years</p>` : ''}
            </div>
            <div class="col-md-6">
                <h6>Fare Information</h6>
                ${fareInfo}
                <p><strong>Status:</strong> <span class="badge bg-warning">Pending</span></p>
            </div>
        </div>
        ${booking.message ? `
        <hr>
        <div class="row">
            <div class="col-12">
                <h6>Additional Comments</h6>
                <p>${booking.message}</p>
            </div>
        </div>
        ` : ''}
    `;

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Function to update passenger statistics in admin panel
function updatePassengerStats(stats) {
    // Try to find existing stats container or create one
    let statsContainer = document.getElementById('passenger-stats');

    if (!statsContainer) {
        // Create stats container if it doesn't exist
        const adminContainer = document.querySelector('.admin-container') || 
                              document.querySelector('.container') || 
                              document.querySelector('main') || 
                              document.body;

        if (adminContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'passenger-stats';
            statsContainer.className = 'row mb-4';

            // Insert at the beginning of the container
            const firstChild = adminContainer.querySelector('h1, h2, .table-responsive, table');
            if (firstChild) {
                adminContainer.insertBefore(statsContainer, firstChild);
            } else {
                adminContainer.appendChild(statsContainer);
            }
        }
    }

    if (statsContainer) {
        const avgAge = stats.kidAges.length > 0 
            ? (stats.kidAges.reduce((a, b) => a + b, 0) / stats.kidAges.length).toFixed(1)
            : 'N/A';

        statsContainer.innerHTML = `
            <div class="col-md-3 mb-3">
                <div class="card bg-primary text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-users fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalPassengers}</h4>
                        <p class="card-text mb-0">Total Passengers</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-secondary text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-user fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalAdults}</h4>
                        <p class="card-text mb-0">Total Adults</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-info text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-child fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalKids}</h4>
                        <p class="card-text mb-0">Total Kids</p>
                        ${stats.kidAges.length > 0 ? `<small>Ages: ${stats.kidAges.join(', ')}</small>` : ''}
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-success text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-gift fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.freeKids}</h4>
                        <p class="card-text mb-0">Free Travel Kids</p>
                        <small>Under 3 years</small>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render bookings if we're on admin page
    if (document.getElementById('booking-table-body')) {
        renderBookings();
    }

    // Attach form handlers
    attachBookingFormHandler();
});

// For booking forms: Attach submit handler to all forms with class 'booking-form' or id 'bookingForm'
function attachBookingFormHandler() {
    const forms = [
        ...document.querySelectorAll('form.booking-form'),
        ...document.querySelectorAll('form#bookingForm')
    ];

    const uniqueForms = Array.from(new Set(forms));

    uniqueForms.forEach(form => {
        if (form.dataset.bookingHandlerAttached) return;

        // Add passenger type change handler
        const passengerTypeSelect = form.querySelector('#passenger-type, [name="passenger-type"]');
        const kidFieldsContainer = form.querySelector('#kid-fields-container');
        const ageGroup = form.querySelector('#age-group');
        const passengerAgeInput = form.querySelector('#passenger-age, [name="passenger-age"]');
        const numKidsInput = form.querySelector('#num-kids, [name="num-kids"]');
        const totalPassengersInput = form.querySelector('#passengers, [name="passengers"]');

        if (passengerTypeSelect && kidFieldsContainer) {
            passengerTypeSelect.addEventListener('change', function() {
                if (this.value === 'Kid') {
                    kidFieldsContainer.style.display = 'block';
                    if (passengerAgeInput) passengerAgeInput.required = true;
                    if (numKidsInput) numKidsInput.required = true;
                } else {
                    kidFieldsContainer.style.display = 'none';
                    if (passengerAgeInput) {
                        passengerAgeInput.required = false;
                        passengerAgeInput.value = '';
                    }
                    if (numKidsInput) {
                        numKidsInput.required = false;
                        numKidsInput.value = '';
                    }
                }
            });
        }

        // Validate that number of kids doesn't exceed total passengers
        if (numKidsInput && totalPassengersInput) {
            numKidsInput.addEventListener('change', function() {
                const totalPassengers = parseInt(totalPassengersInput.value) || 0;
                const numKids = parseInt(this.value) || 0;

                if (numKids > totalPassengers) {
                    alert('Number of kids cannot exceed total passengers');
                    this.value = totalPassengers;
                }
            });

            totalPassengersInput.addEventListener('change', function() {
                const totalPassengers = parseInt(this.value) || 0;
                const numKids = parseInt(numKidsInput.value) || 0;

                if (numKids > totalPassengers) {
                    numKidsInput.value = totalPassengers;
                }
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);

            // Get passenger data
            const passengerType = formData.get('passenger-type') || 'Adult';
            const passengerAge = formData.get('passenger-age');
            const totalPassengers = parseInt(formData.get('passengers')) || 0;
            const numKids = parseInt(formData.get('num-kids')) || 0;

            // Calculate number of adults
            let numAdults = totalPassengers;
            if (passengerType === 'Kid' && numKids > 0) {
                numAdults = totalPassengers - numKids;
                if (numAdults < 0) numAdults = 0; // Safety check
            }

            // Calculate fare status
            let isFreeTravel = false;
            let fareStatus = 'paid';
            let freeKidsCount = 0;

            if (passengerType === 'Kid' && passengerAge) {
                const age = parseInt(passengerAge);
                if (age < 3) {
                    isFreeTravel = true;
                    fareStatus = 'free';
                    freeKidsCount = numKids; // Assuming all kids are the same age
                }
            }

            const booking = {
                id: Date.now(),
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                destination: formData.get('destination') || '',
                travelDate: formData.get('travel-date') || '',
                totalPassengers: totalPassengers,
                numAdults: numAdults,
                numKids: numKids,
                passengerType: passengerType,
                passengerAge: passengerAge,
                isFreeTravel: isFreeTravel,
                fareStatus: fareStatus,
                freeKidsCount: freeKidsCount,
                message: formData.get('message') || '',
                submittedAt: new Date().toISOString()
            };

            saveBooking(booking);

            // Show success message with pricing info if applicable
            let successMessage = 'Booking submitted successfully!';
            if (isFreeTravel && freeKidsCount > 0) {
                successMessage += ` ${freeKidsCount} ${freeKidsCount === 1 ? 'kid' : 'kids'} under 3 ${freeKidsCount === 1 ? 'travels' : 'travel'} free.`;
            }

            typeof showAdminToast === 'function' ? showAdminToast(successMessage) : alert(successMessage);

            // Reset conditional fields
            if (ageGroup) ageGroup.style.display = 'none';
            if (kidFieldsContainer) kidFieldsContainer.style.display = 'none';
        });
            if (numKidsInput) numKidsInput.required = false;

        form.dataset.bookingHandlerAttached = 'true';
    });
}

// Toast notification for admin panel
if (typeof window !== 'undefined') {
    window.renderBookings = renderBookings;
    window.getPassengerStats = getPassengerStats;
    window.attachBookingFormHandler = attachBookingFormHandler;
}

// Poster Management System
const PosterManager = {
    init() {
        this.addPostersTab();
        this.setupPosterForm();
        this.renderPosters();
        this.setupEventListeners();
    },

    addPostersTab() {
        const adminTab = document.getElementById('adminTab');
        if (adminTab && !document.getElementById('posters-tab')) {
            const postersTabItem = document.createElement('li');
            postersTabItem.className = 'nav-item flex-fill text-center';
            postersTabItem.setAttribute('role', 'presentation');
            postersTabItem.innerHTML = `
                <button class="nav-link w-100" id="posters-tab" data-bs-toggle="pill" data-bs-target="#posters" type="button" role="tab">Posters</button>
            `;
            adminTab.appendChild(postersTabItem);
        }
    },

    setupEventListeners() {
        // Listen for poster updates to refresh display
        window.addEventListener('storage', (e) => {
            if (e.key === 'tourPosters') {
                this.renderPosters();
            }
        });
    },

    setupPosterForm() {
        const posterForm = document.getElementById('posterForm');
        if (!posterForm) return;

        posterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('posterTitle').value;
            const imageInput = document.getElementById('posterImage');
            const order = parseInt(document.getElementById('posterOrder').value) || 1;
            
            if (imageInput.files.length === 0) {
                this.showToast('Please select an image!', 'error');
                return;
            }

            try {
                // Compress image before saving
                const compressedImageUrl = await this.compressImage(imageInput.files[0]);
                const posters = this.getPosters();
                
                // Clean up old posters if reaching storage limit
                if (posters.length > 20) {
                    posters.sort((a, b) => a.order - b.order);
                    posters.pop(); // Remove the last poster
                }
                
                // Add new poster
                const newPoster = {
                    id: Date.now().toString(),
                    title: title,
                    image: compressedImageUrl,
                    order: order,
                    addedAt: new Date().toISOString()
                };
                
                posters.push(newPoster);
                posters.sort((a, b) => (a.order || 1) - (b.order || 1));
                
                // Update storage
                try {
                    this.updatePosters(posters);
                    posterForm.reset();
                    this.renderPosters();
                    this.showToast('Poster added successfully!', 'success');
                } catch (storageError) {
                    // If storage is still full after compression
                    this.showToast('Storage is full. Please delete some existing posters.', 'error');
                }
                
            } catch (error) {
                this.showToast('Error processing image. Please try a smaller image.', 'error');
            }
        });
    },

    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions while maintaining aspect ratio
                    const maxSize = 800;
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with reduced quality
                    canvas.toBlob((blob) => {
                        resolve(URL.createObjectURL(blob));
                    }, 'image/jpeg', 0.7); // 70% quality
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    getPosters() {
        return JSON.parse(localStorage.getItem('tourPosters')) || [];
    },

    updatePosters(posters) {
        try {
            // First try to clean up storage
            this.cleanupStorage();
            
            // Convert image URLs to more efficient format
            const processedPosters = posters.map(poster => ({
                ...poster,
                image: poster.image.startsWith('data:') ? poster.image : poster.image
            }));
            
            // Try to save with reduced data
            try {
                localStorage.setItem('tourPosters', JSON.stringify(processedPosters));
            } catch (error) {
                // If still fails, remove oldest posters until it fits
                while (processedPosters.length > 0) {
                    processedPosters.pop();
                    try {
                        localStorage.setItem('tourPosters', JSON.stringify(processedPosters));
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            // Update URLs list separately
            localStorage.setItem('tourPosterUrls', JSON.stringify(processedPosters.map(p => p.image)));
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('postersUpdated', { detail: processedPosters }));
        } catch (error) {
            throw new Error('Failed to update posters: ' + error.message);
        }
    },

    renderPosters() {
        const postersContainer = document.getElementById('postersList');
        if (!postersContainer) return;
        
        const posters = this.getPosters();
        
        if (posters.length === 0) {
            postersContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-images fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No posters added yet. Add your first poster!</p>
                </div>
            `;
            return;
        }
        
        postersContainer.innerHTML = posters.map((poster, index) => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="${poster.image}" class="card-img-top" alt="${poster.title}" 
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${poster.title}</h5>
                        <p class="card-text">
                            <small class="text-muted">Display order: ${poster.order || 1}</small>
                        </p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-danger" onclick="PosterManager.deletePoster('${poster.id}')">
                            <i class="fas fa-trash me-1"></i> Delete
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="PosterManager.movePoster('${poster.id}', ${index > 0})">
                            <i class="fas fa-${index > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    deletePoster(id) {
        if (!confirm('Are you sure you want to delete this poster?')) return;
        
        let posters = this.getPosters();
        posters = posters.filter(poster => poster.id !== id);
        
        this.updatePosters(posters);
        this.renderPosters();
        this.showToast('Poster deleted successfully!', 'success');
    },

    movePoster(id, moveUp) {
        let posters = this.getPosters();
        const index = posters.findIndex(poster => poster.id === id);
        
        if (index === -1) return;
        
        if (moveUp && index > 0) {
            [posters[index], posters[index - 1]] = [posters[index - 1], posters[index]];
        } else if (!moveUp && index < posters.length - 1) {
            [posters[index], posters[index + 1]] = [posters[index + 1], posters[index]];
        }
        
        // Update order numbers
        posters.forEach((poster, i) => poster.order = i + 1);
        
        this.updatePosters(posters);
        this.renderPosters();
    },

    showToast(message, type = 'success') {
        const toast = document.getElementById('admin-toast');
        if (!toast) {
            console.log(message);
            return;
        }
        
        const toastBody = toast.querySelector('.toast-body');
        toastBody.textContent = message;
        
        toast.className = toast.className.replace(/bg-\w+/, `bg-${type === 'error' ? 'danger' : type}`);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    },

    cleanupStorage() {
        try {
            const posters = this.getPosters();
            if (posters.length > 20) {
                // Keep only the 20 most recent posters
                posters.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                posters.splice(20);
                this.updatePosters(posters);
            }
        } catch (error) {
            console.error('Storage cleanup failed:', error);
        }
    },
};

// Initialize poster management
document.addEventListener('DOMContentLoaded', () => {
    PosterManager.init();
});