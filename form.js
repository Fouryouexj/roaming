// Enhanced booking form logic for adults and kids
document.addEventListener('DOMContentLoaded', function() {
    const passengerTypeSelect = document.getElementById('passenger-type');
    const kidFieldsContainer = document.getElementById('kid-fields-container');
    const numKidsInput = document.getElementById('num-kids');
    
    // Show/hide kids fields based on passenger type
    if (passengerTypeSelect && kidFieldsContainer) {
        passengerTypeSelect.addEventListener('change', function() {
            if (this.value === 'Kid') {
                kidFieldsContainer.style.display = 'block';
                kidFieldsContainer.style.animation = 'fadeIn 0.3s ease';
                numKidsInput.required = true;
            } else {
                kidFieldsContainer.style.display = 'none';
                numKidsInput.required = false;
                numKidsInput.value = '';
                
                // Clear any dynamically generated age inputs
                const ageInputsContainer = document.getElementById('kids-ages-container');
                if (ageInputsContainer) {
                    ageInputsContainer.innerHTML = '';
                }
            }
        });
        
        // Generate age input fields when number of kids changes
        if (numKidsInput) {
            numKidsInput.addEventListener('input', function() {
                const numKids = parseInt(this.value) || 0;
                let ageInputsContainer = document.getElementById('kids-ages-container');
                
                // Create container if it doesn't exist
                if (!ageInputsContainer) {
                    ageInputsContainer = document.createElement('div');
                    ageInputsContainer.id = 'kids-ages-container';
                    ageInputsContainer.className = 'mt-3';
                    kidFieldsContainer.appendChild(ageInputsContainer);
                }
                
                // Clear existing age inputs
                ageInputsContainer.innerHTML = '';
                
                // Generate age input for each kid
                for (let i = 1; i <= numKids; i++) {
                    const ageInputGroup = document.createElement('div');
                    ageInputGroup.className = 'form-group mb-2';
                    
                    const label = document.createElement('label');
                    label.htmlFor = `kid-age-${i}`;
                    label.textContent = `Age of Kid ${i}:`;
                    label.className = 'form-label';
                    
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = `kid-age-${i}`;
                    input.name = `kid-age-${i}`;
                    input.placeholder = `Age of kid ${i}`;
                    input.min = '0';
                    input.max = '17';
                    input.className = 'form-control';
                    input.required = true;
                    
                    ageInputGroup.appendChild(label);
                    ageInputGroup.appendChild(input);
                    ageInputsContainer.appendChild(ageInputGroup);
                }
                
                // Add pricing info
                if (numKids > 0) {
                    const pricingInfo = document.createElement('div');
                    pricingInfo.className = 'alert alert-info mt-2';
                    pricingInfo.innerHTML = `
                        <i class="fas fa-info-circle"></i>
                        <strong>Pricing Note:</strong> Kids above 3 years are charged as adults for park fees and accommodation.
                    `;
                    ageInputsContainer.appendChild(pricingInfo);
                }
            });
        }
    }
    
    // Enhanced form submission handling with real-time sync
    const bookingForm = document.querySelector('.booking-form') || document.querySelector('#bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Add kids ages if applicable
            if (passengerTypeSelect.value === 'Kid') {
                const numKids = parseInt(numKidsInput.value) || 0;
                const kidsAges = [];
                
                for (let i = 1; i <= numKids; i++) {
                    const ageInput = document.getElementById(`kid-age-${i}`);
                    if (ageInput && ageInput.value) {
                        kidsAges.push(parseInt(ageInput.value));
                    }
                }
                
                data.kidsAges = kidsAges;
                data.kidsAbove3 = kidsAges.filter(age => age > 3).length;
                data.kidsAboveThree = kidsAges.filter(age => age > 3).length;
                data.numKids = numKids.toString();
            }
            
            // Add booking ID and timestamp
            data.id = 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            data.timestamp = new Date().toISOString();
            data.page = document.title || 'Tour Booking';
            data.status = 'pending';
            
            // Submit to server for real-time sync
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Booking submitted successfully:', result);
                    
                    // Broadcast to other tabs/devices
                    if (typeof BroadcastChannel !== 'undefined') {
                        const bc = new BroadcastChannel('bookings_channel');
                        bc.postMessage({ 
                            type: 'newBooking', 
                            booking: data 
                        });
                    }
                    
                    // Show success message
                    showBookingSuccess(data);
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.warn('Server unavailable, saving locally:', error);
                
                // Fallback to localStorage
                const localBookings = JSON.parse(localStorage.getItem('tourBookings')) || [];
                localBookings.push(data);
                localStorage.setItem('tourBookings', JSON.stringify(localBookings));
                
                // Show success message
                showBookingSuccess(data);
            }
            
            // Reset form
            this.reset();
            kidFieldsContainer.style.display = 'none';
            const ageInputsContainer = document.getElementById('kids-ages-container');
            if (ageInputsContainer) {
                ageInputsContainer.innerHTML = '';
            }
        });
    }
    
    // Listen for cross-tab booking updates
    if (typeof BroadcastChannel !== 'undefined') {
        const bookingBC = new BroadcastChannel('bookings_channel');
        bookingBC.addEventListener('message', function(event) {
            if (event.data.type === 'newBooking') {
                console.log('New booking received from another tab:', event.data.booking);
                // You could show a notification here if needed
            }
        });
    }
});

// Show booking success message
function showBookingSuccess(data) {
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success alert-dismissible fade show position-fixed';
    successMessage.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    
    let message = `
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        <h5><i class="fas fa-check-circle"></i> Booking Request Submitted!</h5>
        <p><strong>Name:</strong> ${data.name}<br>
        <strong>Email:</strong> ${data.email}<br>
        <strong>Passengers:</strong> ${data.passengers}`;
        
    if (data.kidsAges && data.kidsAges.length > 0) {
        message += `<br><strong>Kids Ages:</strong> ${data.kidsAges.join(', ')}`;
        if (data.kidsAbove3 > 0) {
            message += `<br><small class="text-warning">Note: ${data.kidsAbove3} kid(s) above 3 years will be charged as adults.</small>`;
        }
    }
    
    message += `</p><p class="mb-0">We'll contact you within 24 hours with tour details and payment information.</p>`;
    
    successMessage.innerHTML = message;
    document.body.appendChild(successMessage);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.remove();
        }
    }, 8000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .alert-info {
        border-left: 4px solid #17a2b8;
    }
    
    .alert-success {
        border-left: 4px solid #28a745;
    }
`;
document.head.appendChild(style);