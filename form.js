document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const bookingForm = document.getElementById('bookingForm');
    const passengerTypeSelect = document.getElementById('passenger-type');
    const kidFieldsContainer = document.getElementById('kid-fields-container');
    const ageGroup = document.getElementById('age-group');
    const passengerAgeInput = document.getElementById('passenger-age');
    const numKidsInput = document.getElementById('num-kids');
    const totalPassengersInput = document.getElementById('passengers');

    // Handle passenger type dropdown change
    if (passengerTypeSelect && kidFieldsContainer) {
        passengerTypeSelect.addEventListener('change', function() {
            if (this.value === 'Kid') {
                kidFieldsContainer.style.display = 'block';
                passengerAgeInput.required = true;
                numKidsInput.required = true;
            } else {
                kidFieldsContainer.style.display = 'none';
                passengerAgeInput.required = false;
                numKidsInput.required = false;
                passengerAgeInput.value = '';
                numKidsInput.value = '';
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

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const passengerType = formData.get('passenger-type');
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
            let fareNote = '';
            let freeKidsCount = 0;
            
            if (passengerType === 'Kid' && passengerAge) {
                const age = parseInt(passengerAge);
                if (age < 3) {
                    isFreeTravel = true;
                    fareStatus = 'free';
                    fareNote = 'Kids under 3 travel free';
                    freeKidsCount = numKids; // Assuming all kids are the same age
                } else {
                    fareStatus = 'paid';
                    fareNote = 'Normal kid fare applies';
                }
            }
            
            // Create booking object
            const bookingData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                destination: formData.get('destination'),
                travelDate: formData.get('travel-date'),
                totalPassengers: totalPassengers,
                numAdults: numAdults,
                numKids: numKids,
                passengerType: passengerType,
                passengerAge: passengerAge,
                isFreeTravel: isFreeTravel,
                fareStatus: fareStatus,
                freeKidsCount: freeKidsCount,
                message: formData.get('message'),
                submittedAt: new Date().toISOString()
            };
            
            // Save to localStorage (simulating backend)
            let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Show success message
            let successMessage = 'Booking submitted successfully!';
            if (isFreeTravel && freeKidsCount > 0) {
                successMessage += ` ${freeKidsCount} ${freeKidsCount === 1 ? 'kid' : 'kids'} under 3 ${freeKidsCount === 1 ? 'travels' : 'travel'} free.`;
            }
            
            alert(successMessage);
            
            // Reset form
            this.reset();
            kidFieldsContainer.style.display = 'none';
            passengerAgeInput.required = false;
            numKidsInput.required = false;
        });
    }
});
