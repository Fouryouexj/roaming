function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    // Ensure each booking has a unique ID
    if (!booking.id) {
        booking.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Utility: Get all bookings
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Enhanced function to get passenger statistics with kids above 3 years tracking
function getPassengerStats() {
    const bookings = getBookings();
    const stats = {
        totalPassengers: 0,
        totalAdults: 0,
        totalKids: 0,
        kidAges: [],
        freeKids: 0,
        kidsAboveThree: 0,
        totalBookings: bookings.length
    };

    bookings.forEach(booking => {
        // Add to total passengers
        stats.totalPassengers += parseInt(booking.totalPassengers) || 0;

        // Count adults and kids
        if (booking.numAdults !== undefined) {
            stats.totalAdults += parseInt(booking.numAdults);
        } else if (booking.passengerType !== 'Kid') {
            // Legacy data without numAdults field
            stats.totalAdults += parseInt(booking.totalPassengers) || 0;
        }

        if (booking.numKids !== undefined) {
            stats.totalKids += parseInt(booking.numKids);

            // Count free kids and kids above 3
            if (booking.kidsAboveThree !== undefined) {
                stats.kidsAboveThree += parseInt(booking.kidsAboveThree);
                // Free kids are those under 3
                stats.freeKids += (parseInt(booking.numKids) - parseInt(booking.kidsAboveThree));
            } else if (booking.freeKidsCount !== undefined) {
                stats.freeKids += parseInt(booking.freeKidsCount);
            } else if (booking.isFreeTravel) {
                stats.freeKids += parseInt(booking.numKids);
            } else if (booking.passengerAge && parseInt(booking.passengerAge) < 3) {
                stats.freeKids += parseInt(booking.numKids);
            } else if (booking.passengerAge && parseInt(booking.passengerAge) >= 3) {
                stats.kidsAboveThree += parseInt(booking.numKids);
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

            if (booking.isFreeTravel || (booking.passengerAge && parseInt(booking.passengerAge) < 3)) {
                stats.freeKids += parseInt(booking.totalPassengers) || 0;
            } else if (booking.passengerAge && parseInt(booking.passengerAge) >= 3) {
                stats.kidsAboveThree += parseInt(booking.totalPassengers) || 0;
            }

            if (booking.passengerAge) {
                const age = parseInt(booking.passengerAge);
                stats.kidAges.push(age);
            }
        }
    });

    return stats;
}


// Enhanced renderBookings function for admin panel
function renderBookings() {
    const tableBody = document.getElementById('booking-table-body');
    const emptyMsg = document.getElementById('empty-message');
    if (!tableBody) return;

    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Ensure all bookings have IDs
    let needsUpdate = false;
    bookings = bookings.map((booking, index) => {
        if (!booking.id) {
            booking.id = Date.now().toString() + index + Math.random().toString(36).substr(2, 5);
            needsUpdate = true;
        }
        return booking;
    });

    if (needsUpdate) {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

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
        // Enhanced passengers column display
        const totalPassengers = booking.totalPassengers || booking.passengers || 0;
        const numAdults = booking.numAdults || 0;
        const numKids = booking.numKids || 0;
        const kidsAboveThree = booking.kidsAboveThree || 0;
        const freeKidsCount = booking.freeKidsCount || 0;
        
        let passengersCol = `<div class="passenger-info">
            <strong class="total-passengers">${totalPassengers} Total</strong>`;
        
        if (numAdults > 0 || numKids > 0) {
            passengersCol += `
            <div class="passenger-breakdown">
                <small class="text-muted d-block">
                    <i class="fas fa-user me-1"></i>Adults: ${numAdults}
                </small>
                <small class="text-info d-block">
                    <i class="fas fa-child me-1"></i>Kids: ${numKids}
                </small>`;
            
            // Show kids age breakdown
            if (numKids > 0) {
                if (kidsAboveThree > 0) {
                    passengersCol += `
                    <small class="text-warning d-block ms-2">
                        <i class="fas fa-ticket-alt me-1"></i>Above 3: ${kidsAboveThree}
                    </small>`;
                }
                
                if (freeKidsCount > 0) {
                    passengersCol += `
                    <small class="text-success d-block ms-2">
                        <i class="fas fa-gift me-1"></i>Under 3: ${freeKidsCount} (Free)
                    </small>`;
                }
                
                // Show individual ages if available
                if (booking.kidsAges && Array.isArray(booking.kidsAges) && booking.kidsAges.length > 0) {
                    const agesDisplay = booking.kidsAges.join(', ');
                    passengersCol += `
                    <small class="text-secondary d-block ms-2">
                        <i class="fas fa-birthday-cake me-1"></i>Ages: ${agesDisplay} yrs
                    </small>`;
                }
            }
            
            passengersCol += `</div>`;
        } else if (booking.passengerType === 'Kid') {
            passengersCol += `
            <div class="passenger-breakdown">
                <small class="text-info d-block">All Kids</small>`;
            
            if (booking.passengerAge) {
                passengersCol += `
                <small class="text-secondary d-block">Age: ${booking.passengerAge} yrs</small>`;
            }
            
            if (booking.isFreeTravel) {
                passengersCol += `
                <small class="text-success d-block">
                    <i class="fas fa-gift me-1"></i>Free Travel
                </small>`;
            }
            
            passengersCol += `</div>`;
        }
        
        passengersCol += `</div>`;

        // Status column with improved display
        const status = booking.status || 'pending';
        let statusDisplay = '';
        if (status === 'viewed') {
            statusDisplay = `<span class="badge bg-success mb-2 d-block">
                <i class="fas fa-check me-1"></i>Viewed
            </span>`;
        } else {
            statusDisplay = `<span class="badge bg-warning mb-2 d-block">
                <i class="fas fa-hourglass-half me-1"></i>Pending
            </span>`;
        }

        const row = document.createElement('tr');
        row.className = status === 'viewed' ? 'table-light' : '';
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td>
                <strong>${booking.name || 'N/A'}</strong>
                ${booking.passengerType && booking.passengerType !== 'Adult' ? 
                    `<br><small class="badge bg-info">${booking.passengerType}</small>` : ''}
            </td>
            <td>
                <a href="mailto:${booking.email || ''}" class="text-decoration-none">
                    ${booking.email || 'N/A'}
                </a>
            </td>
            <td>
                <a href="tel:${booking.phone || ''}" class="text-decoration-none">
                    ${booking.phone || 'N/A'}
                </a>
            </td>
            <td><strong>${booking.destination || booking.tour || 'N/A'}</strong></td>
            <td>${booking.travelDate || booking.date || booking['travel-date'] || 'N/A'}</td>
            <td class="passenger-details">${passengersCol}</td>
            <td style="max-width:200px;word-break:break-word;">
                ${booking.message || '<em class="text-muted">No message</em>'}
            </td>
            <td>
                ${statusDisplay}
                <input type="text" class="form-control form-control-sm status-note" 
                       placeholder="Admin note..." 
                       value="${booking.statusNote || ''}" 
                       data-booking-id="${booking.id}" 
                       style="min-width:120px;max-width:180px;">
            </td>
            <td>${booking.submittedAt ? new Date(booking.submittedAt).toLocaleDateString() : 
                 (booking.submitted ? new Date(booking.submitted).toLocaleDateString() : 'N/A')}</td>
        `;

        // Add click handlers
        const statusBadge = row.querySelector('.badge');
        if (statusBadge) {
            statusBadge.style.cursor = 'pointer';
            statusBadge.title = 'Click to toggle status';
            statusBadge.addEventListener('click', function() {
                const newStatus = status === 'viewed' ? 'pending' : 'viewed';
                updateBookingStatus(booking.id, newStatus);
            });
        }

        // Save status note on change
        const statusNoteInput = row.querySelector('.status-note');
        if (statusNoteInput) {
            statusNoteInput.addEventListener('change', function() {
                saveStatusNote(booking.id, this.value);
            });
        }

        // Add double-click to view details
        row.addEventListener('dblclick', function() {
            showBookingDetails(booking);
        });

        tableBody.appendChild(row);
    });
}

// Add some CSS styles for better display
const style = document.createElement('style');
style.textContent = `
    .passenger-info {
        min-width: 150px;
    }
    
    .passenger-breakdown {
        margin-top: 0.25rem;
        padding-left: 0.25rem;
        border-left: 2px solid #dee2e6;
    }
    
    .total-passengers {
        color: #495057;
        font-size: 1rem;
    }
    
    .passenger-details small {
        font-size: 0.75rem;
        line-height: 1.2;
    }
    
    .badge {
        font-size: 0.65rem;
    }
`;
document.head.appendChild(style);

// Function to update booking status
function updateBookingStatus(bookingId, newStatus) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        bookings[bookingIndex].statusUpdatedAt = new Date().toISOString();
        localStorage.setItem('bookings', JSON.stringify(bookings));

        // Show toast notification
        const message = `Booking marked as ${newStatus}`;
        if (typeof showAdminToast === 'function') {
            showAdminToast(message, 'success');
        }

        // Re-render bookings to update display
        renderBookings();
        return true;
    }
    return false;
}

// Function to save status note
function saveStatusNote(bookingId, note) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex !== -1) {
        bookings[bookingIndex].statusNote = note;
        bookings[bookingIndex].noteUpdatedAt = new Date().toISOString();
        localStorage.setItem('bookings', JSON.stringify(bookings));

        if (note.trim()) {
            if (typeof showAdminToast === 'function') {
                showAdminToast('Admin note saved', 'success');
            }
        }
        return true;
    }
    return false;
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

    // Create kids details section with improved formatting
    let kidsDetailsSection = '';
    if (booking.numKids > 0) {
        const kidsAboveThree = parseInt(booking.kidsAboveThree) || 0;
        const kidsUnderThree = parseInt(booking.numKids) - kidsAboveThree;

        if (kidsAboveThree > 0) {
            kidsDetailsSection += `<div><strong>Above 3:</strong> ${kidsAboveThree} <span class="badge bg-primary">Paid</span></div>`;
        }

        if (kidsUnderThree > 0) {
            kidsDetailsSection += `<div><strong>Under 3:</strong> ${kidsUnderThree} <span class="badge bg-success">Free</span></div>`;
        }
    } else if (booking.passengerType === 'Kid') {
        if (booking.isFreeTravel || (booking.passengerAge && parseInt(booking.passengerAge) < 3)) {
            kidsDetailsSection = `<div><span class="badge bg-success">Free Travel</span></div>`;
        } else {
            kidsDetailsSection = `<div><span class="badge bg-primary">Paid Travel</span></div>`;
        }
    } else {
        kidsDetailsSection = `<div><span class="badge bg-secondary">N/A</span></div>`;
    }

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
                <p><strong>Travel Date:</strong> ${booking.travelDate || booking.date || booking['travel-date'] || 'N/A'}</p>
                <p><strong>Submitted:</strong> ${booking.submittedAt ? new Date(booking.submittedAt).toLocaleString() : 'N/A'}</p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h6>Passenger Information</h6>
                <p><strong>Total Passengers:</strong> ${booking.totalPassengers || booking.passengers || 'N/A'}</p>
                <p><strong>Adults:</strong> ${booking.numAdults !== undefined ? booking.numAdults : 'N/A'}</p>
                <p><strong>Kids:</strong> ${booking.numKids !== undefined ? booking.numKids : (booking.passengerType === 'Kid' ? booking.totalPassengers : '0')}</p>
                 ${booking.kidsAges && Array.isArray(booking.kidsAges) && booking.kidsAges.length > 0
                    ? `<p><strong>Kids' Ages:</strong> ${booking.kidsAges.map((age, idx) => `Kid ${idx+1}: ${age} yrs`).join(', ')}</p>`
                    : (booking.passengerAge ? `<p><strong>Kid Age:</strong> ${booking.passengerAge} years</p>` : '')
                }
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
    let statsContainer = document.getElementById('passenger-stats');

    if (!statsContainer) {
        // Create stats container if it doesn't exist
        const bookingsTab = document.getElementById('bookings');
        if (bookingsTab) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'passenger-stats';
            statsContainer.className = 'row mb-4';

            // Insert before the bookings table
            const tableContainer = bookingsTab.querySelector('.table-responsive');
            if (tableContainer) {
                bookingsTab.insertBefore(statsContainer, tableContainer);
            } else {
                bookingsTab.appendChild(statsContainer);
            }
        }
    }

    if (statsContainer) {
        const avgAge = stats.kidAges.length > 0 
            ? (stats.kidAges.reduce((a, b) => a + b, 0) / stats.kidAges.length).toFixed(1)
            : 'N/A';

        statsContainer.innerHTML = `
            <div class="col-md-2 mb-3">
                <div class="card bg-primary text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-users fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalPassengers}</h4>
                        <p class="card-text mb-0">Total Passengers</p>
                    </div>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="card bg-secondary text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-user fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalAdults}</h4>
                        <p class="card-text mb-0">Total Adults</p>
                    </div>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="card bg-info text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-child fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.totalKids}</h4>
                        <p class="card-text mb-0">Total Kids</p>
                        ${avgAge !== 'N/A' ? `<small>Avg Age: ${avgAge} yrs</small>` : ''}
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-warning text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-ticket-alt fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.kidsAboveThree}</h4>
                        <p class="card-text mb-0">Kids Above 3</p>
                        <small>Paid Travel</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-success text-white h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-gift fa-2x mb-2"></i>
                        <h4 class="card-title">${stats.freeKids}</h4>
                        <p class="card-text mb-0">Kids Under 3</p>
                        <small>Free Travel</small>
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

    // Add tab event listeners to refresh data when switching tabs
    const bookingsTab = document.getElementById('bookings-tab');
    if (bookingsTab) {
        bookingsTab.addEventListener('shown.bs.tab', function() {
            setTimeout(() => {
                renderBookings();
            }, 100);
        });
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
            let kidsAboveThree = 0;

            if (passengerType === 'Kid' && passengerAge) {
                const age = parseInt(passengerAge);
                if (age < 3) {
                    isFreeTravel = true;
                    fareStatus = 'free';
                    freeKidsCount = numKids; // Assuming all kids are the same age
                } else {
                    kidsAboveThree = numKids;
                }
            }

            const booking = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
                kidsAboveThree: kidsAboveThree,
                message: formData.get('message') || '',
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };

            saveBooking(booking);

            // Show success message with pricing info if applicable
            let successMessage = 'Booking submitted successfully!';
            if (isFreeTravel && freeKidsCount > 0) {
                successMessage += ` ${freeKidsCount} ${freeKidsCount === 1 ? 'kid' : 'kids'} under 3 ${freeKidsCount === 1 ? 'travels' : 'travel'} free.`;
            }

            if (typeof showAdminToast === 'function') {
                showAdminToast(successMessage, 'success');
            } else {
                alert(successMessage);
            }

            // Reset form and conditional fields
            form.reset();
            const ageGroup = form.querySelector('#age-group');
            const kidFieldsContainer = form.querySelector('#kid-fields-container');
            if (ageGroup) ageGroup.style.display = 'none';
            if (kidFieldsContainer) kidFieldsContainer.style.display = 'none';

            // Refresh bookings if on admin page
            if (document.getElementById('booking-table-body')) {
                setTimeout(() => renderBookings(), 500);
            }
        });

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
            const description = document.getElementById('posterDescription').value;
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
                if (posters.length > 25) {
                    posters.sort((a, b) => a.order - b.order);
                    posters.pop(); // Remove the last poster
                }

                // Add new poster
                const newPoster = {
                    id: Date.now().toString(),
                    title: title,
                    description: description,
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

                    // Convert to JPEG Data URL with reduced quality for persistence
                    try {
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
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
            if (posters.length > 25) {
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
