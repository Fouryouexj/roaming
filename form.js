document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const bookingForm = document.getElementById('bookingForm');
    const passengerTypeSelect = document.getElementById('passenger-type');
    const kidFieldsContainer = document.getElementById('kid-fields-container');
    const ageGroup = document.getElementById('age-group');
    const passengerAgeInput = document.getElementById('passenger-age');
    const numKidsInput = document.getElementById('num-kids');
    const totalPassengersInput = document.getElementById('passengers');
    
    // Add new field for kids above 3 years
    let kidsAboveThreeInput = document.getElementById('kids-above-three');
    
    // If the element doesn't exist yet, we'll create it in the HTML update
    
    // Handle passenger type dropdown change
    if (passengerTypeSelect && kidFieldsContainer) {
        passengerTypeSelect.addEventListener('change', function() {
            if (this.value === 'Kid') {
                kidFieldsContainer.style.display = 'block';
                passengerAgeInput.required = true;
                numKidsInput.required = true;
                if (kidsAboveThreeInput) kidsAboveThreeInput.required = true;
            } else {
                kidFieldsContainer.style.display = 'none';
                passengerAgeInput.required = false;
                numKidsInput.required = false;
                passengerAgeInput.value = '';
                numKidsInput.value = '';
                if (kidsAboveThreeInput) {
                    kidsAboveThreeInput.required = false;
                    kidsAboveThreeInput.value = '';
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

            // Dynamically generate age fields for each kid
            const kidsAgesContainer = document.getElementById('kids-ages-container');
            kidsAgesContainer.innerHTML = '';
            for (let i = 0; i < numKids; i++) {
                const ageInput = document.createElement('input');
                ageInput.type = 'number';
                ageInput.name = `kid-age-${i+1}`;
                ageInput.className = 'form-control mb-2';
                ageInput.placeholder = `Age of Kid ${i+1}`;
                ageInput.min = 0;
                ageInput.max = 17;
                ageInput.required = true;
                kidsAgesContainer.appendChild(ageInput);
            }

            // Update max value for kids above 3
            if (kidsAboveThreeInput) {
                kidsAboveThreeInput.max = this.value;
                if (parseInt(kidsAboveThreeInput.value) > numKids) {
                    kidsAboveThreeInput.value = numKids;
                }
            }
        });

        totalPassengersInput.addEventListener('change', function() {
            const totalPassengers = parseInt(this.value) || 0;
            const numKids = parseInt(numKidsInput.value) || 0;

            if (numKids > totalPassengers) {
                numKidsInput.value = totalPassengers;
            }
            // Also update age fields if needed
            numKidsInput.dispatchEvent(new Event('change'));
        });
    }
   
    
    // Add validation for kids above 3
    if (kidsAboveThreeInput && numKidsInput) {
        kidsAboveThreeInput.addEventListener('change', function() {
            const numKids = parseInt(numKidsInput.value) || 0;
            const kidsAboveThree = parseInt(this.value) || 0;
            
            if (kidsAboveThree > numKids) {
                alert('Number of kids above 3 years cannot exceed total number of kids');
                this.value = numKids;
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
            
            // Get kids above 3 years
            const kidsAboveThree = kidsAboveThreeInput ? 
                (parseInt(kidsAboveThreeInput.value) || 0) : 0;
            
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
            
            if (passengerType === 'Kid' && numKids > 0) {
                // Calculate free kids (those under 3)
                freeKidsCount = numKids - kidsAboveThree;
                
                if (freeKidsCount > 0) {
                    fareNote = `${freeKidsCount} kid${freeKidsCount > 1 ? 's' : ''} under 3 travel free`;
                }
                
                if (kidsAboveThree > 0) {
                    fareStatus = 'partial';
                    if (fareNote) {
                        fareNote += `, ${kidsAboveThree} kid${kidsAboveThree > 1 ? 's' : ''} above 3 require payment`;
                    } else {
                        fareNote = `All ${kidsAboveThree} kid${kidsAboveThree > 1 ? 's' : ''} require payment`;
                    }
                } else if (freeKidsCount === numKids) {
                    isFreeTravel = true;
                    fareStatus = 'free';
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
                kidsAboveThree: kidsAboveThree,
                kidsUnderThree: freeKidsCount,
                passengerType: passengerType,
                passengerAge: passengerAge,
                isFreeTravel: isFreeTravel,
                fareStatus: fareStatus,
                fareNote: fareNote,
                message: formData.get('message'),
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };
            
            // Save to localStorage (simulating backend)
            let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Show success message
            let successMessage = 'Booking submitted successfully!';
            if (fareNote) {
                successMessage += ' ' + fareNote;
            }
            
            alert(successMessage);
            
            // Reset form
            this.reset();
            kidFieldsContainer.style.display = 'none';
            passengerAgeInput.required = false;
            numKidsInput.required = false;
            if (kidsAboveThreeInput) kidsAboveThreeInput.required = false;
        });
    }
});
