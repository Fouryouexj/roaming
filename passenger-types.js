// passenger-types.js - Handles passenger type selection and age-based pricing

document.addEventListener('DOMContentLoaded', function() {
    // Find all booking forms
    const bookingForms = document.querySelectorAll('form.booking-form, form#bookingForm');
    
    bookingForms.forEach(form => {
        // Check if form already has passenger type fields
        if (form.querySelector('.passenger-type-container')) return;
        
        // Find the passengers input field
        const passengersField = form.querySelector('#passengers') || form.querySelector('[name="passengers"]');
        if (!passengersField) return;
        
        // Create passenger type selection
        const passengerTypeContainer = document.createElement('div');
        passengerTypeContainer.className = 'form-group passenger-type-container mb-3';
        
        passengerTypeContainer.innerHTML = `
            <label class="form-label">Passenger Type</label>
            <div class="d-flex gap-3">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="passengerType" id="adultType" value="adult" checked>
                    <label class="form-check-label" for="adultType">Adult</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="passengerType" id="kidType" value="kid">
                    <label class="form-check-label" for="kidType">Kid</label>
                </div>
            </div>
            <div class="kid-age-container mt-3" style="display: none;">
                <label class="form-label">Kid's Age</label>
                <input type="number" class="form-control" name="kidAge" min="0" max="17" placeholder="Age (years)">
                <small class="text-muted">Kids under 3 travel free</small>
            </div>
        `;
        
        // Insert after passengers field
        passengersField.parentNode.insertAdjacentElement('afterend', passengerTypeContainer);
        
        // Add event listeners for passenger type selection
        const kidTypeRadio = passengerTypeContainer.querySelector('#kidType');
        const adultTypeRadio = passengerTypeContainer.querySelector('#adultType');
        const kidAgeContainer = passengerTypeContainer.querySelector('.kid-age-container');
        
        kidTypeRadio.addEventListener('change', function() {
            if (this.checked) {
                kidAgeContainer.style.display = 'block';
            }
        });
        
        adultTypeRadio.addEventListener('change', function() {
            if (this.checked) {
                kidAgeContainer.style.display = 'none';
            }
        });
    });
});
