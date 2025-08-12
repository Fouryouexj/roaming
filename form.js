document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const bookingForm = document.getElementById('bookingForm');
    const passengerTypeSelect = document.getElementById('passenger-type');
    const kidFieldsContainer = document.getElementById('kid-fields-container');
    const numKidsInput = document.getElementById('num-kids');
    const totalPassengersInput = document.getElementById('passengers');
    const kidsAboveThreeInput = document.getElementById('kids-above-three');

    // Handle passenger type dropdown change
    if (passengerTypeSelect && kidFieldsContainer) {
        passengerTypeSelect.addEventListener('change', function() {
            if (this.value === 'Kid') {
                kidFieldsContainer.style.display = 'block';
                if (numKidsInput) numKidsInput.required = true;
                if (kidsAboveThreeInput) kidsAboveThreeInput.required = true;
            } else {
                kidFieldsContainer.style.display = 'none';
                if (numKidsInput) {
                    numKidsInput.required = false;
                    numKidsInput.value = '';
                }
                if (kidsAboveThreeInput) {
                    kidsAboveThreeInput.required = false;
                    kidsAboveThreeInput.value = '';
                }
                // Clear age inputs
                const kidsAgesContainer = document.getElementById('kids-ages-container');
                if (kidsAgesContainer) {
                    kidsAgesContainer.innerHTML = '';
                }
            }
        });
    }

    // Generate age input fields dynamically
    if (numKidsInput) {
        numKidsInput.addEventListener('input', function() {
            const numKids = parseInt(this.value) || 0;
            const totalPassengers = parseInt(totalPassengersInput.value) || 0;
            
            // Validate number of kids
            if (numKids > totalPassengers) {
                alert('Number of kids cannot exceed total passengers');
                this.value = Math.min(numKids, totalPassengers);
                return;
            }

            // Generate age input fields
            const kidsAgesContainer = document.getElementById('kids-ages-container');
            if (kidsAgesContainer) {
                kidsAgesContainer.innerHTML = '';
                
                for (let i = 0; i < numKids; i++) {
                    const ageInputGroup = document.createElement('div');
                    ageInputGroup.className = 'input-group mb-2';
                    ageInputGroup.innerHTML = `
                        <span class="input-group-text">Kid ${i + 1} Age:</span>
                        <input type="number" 
                               name="kid-age-${i + 1}" 
                               class="form-control kid-age-input" 
                               placeholder="Age" 
                               min="0" 
                               max="17" 
                               required>
                    `;
                    kidsAgesContainer.appendChild(ageInputGroup);
                }

                // Auto-calculate kids above 3 when ages are entered
                const ageInputs = kidsAgesContainer.querySelectorAll('.kid-age-input');
                ageInputs.forEach(input => {
                    input.addEventListener('input', calculateKidsAboveThree);
                });
            }

            // Update max value for kids above 3
            if (kidsAboveThreeInput) {
                kidsAboveThreeInput.max = numKids;
                if (parseInt(kidsAboveThreeInput.value) > numKids) {
                    kidsAboveThreeInput.value = numKids;
                }
            }
        });
    }

    // Auto-calculate kids above 3 based on entered ages
    function calculateKidsAboveThree() {
        const ageInputs = document.querySelectorAll('.kid-age-input');
        let kidsAboveThree = 0;
        
        ageInputs.forEach(input => {
            const age = parseInt(input.value);
            if (age >= 3) {
                kidsAboveThree++;
            }
        });
        
        if (kidsAboveThreeInput) {
            kidsAboveThreeInput.value = kidsAboveThree;
        }
    }

    // Validate total passengers
    if (totalPassengersInput && numKidsInput) {
        totalPassengersInput.addEventListener('change', function() {
            const totalPassengers = parseInt(this.value) || 0;
            const numKids = parseInt(numKidsInput.value) || 0;

            if (numKids > totalPassengers) {
                numKidsInput.value = totalPassengers;
                numKidsInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            // Get passenger details
            const totalPassengers = parseInt(formData.get('passengers')) || 0;
            const numKids = parseInt(formData.get('num-kids')) || 0;
            const numAdults = totalPassengers - numKids;
            const passengerType = formData.get('passenger-type') || 'Adult';
            const kidsAboveThree = parseInt(formData.get('kids-above-three')) || 0;
            
            // Collect kids' ages
            const kidsAges = [];
            for (let i = 1; i <= numKids; i++) {
                const age = formData.get(`kid-age-${i}`);
                if (age) {
                    kidsAges.push(parseInt(age));
                }
            }

            // Calculate free kids (under 3)
            const freeKidsCount = kidsAges.filter(age => age < 3).length;

            // Create booking object with consistent field names
            const bookingData = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                // Map form fields to admin expected names
                destination: formData.get('destination') || '',
                tour: formData.get('destination') || '', // Admin expects 'tour' field
                date: formData.get('travel-date') || '',
                travelDate: formData.get('travel-date') || '',
                'travel-date': formData.get('travel-date') || '',
                // Passenger details
                totalPassengers: totalPassengers,
                passengers: totalPassengers, // Admin expects 'passengers' field
                numAdults: numAdults,
                numKids: numKids,
                kidsAges: kidsAges,
                kidsAboveThree: kidsAboveThree,
                freeKidsCount: freeKidsCount,
                passengerType: passengerType,
                // Fare calculations
                isFreeTravel: numKids > 0 && freeKidsCount === numKids,
                fareStatus: freeKidsCount > 0 ? (freeKidsCount === numKids ? 'free' : 'mixed') : 'paid',
                // Other details
                message: formData.get('message') || '',
                submittedAt: new Date().toISOString(),
                submitted: new Date().toISOString(),
                status: 'pending'
            };

            try {
                // Save booking to localStorage
                let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
                bookings.push(bookingData);
                localStorage.setItem('bookings', JSON.stringify(bookings));

                // Create success message
                let successMessage = 'Booking submitted successfully!';
                if (freeKidsCount > 0) {
                    successMessage += ` ${freeKidsCount} kid${freeKidsCount > 1 ? 's' : ''} under 3 travel${freeKidsCount === 1 ? 's' : ''} free.`;
                }
                
                // Show success message
                alert(successMessage);
                
                // Reset form
                this.reset();
                kidFieldsContainer.style.display = 'none';
                document.getElementById('kids-ages-container').innerHTML = '';
                
                // Trigger admin panel refresh if on same page
                if (typeof window.renderBookings === 'function') {
                    setTimeout(() => window.renderBookings(), 500);
                }
                
                console.log('Booking saved:', bookingData);
                
            } catch (error) {
                console.error('Error saving booking:', error);
                alert('Error submitting booking. Please try again.');
            }
        });
    }

    // Initialize form if passenger type is already selected
    if (passengerTypeSelect && passengerTypeSelect.value === 'Kid') {
        kidFieldsContainer.style.display = 'block';
    }
});

// Utility function for debugging - you can remove this in production
function debugBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    console.table(bookings);
    return bookings;
}