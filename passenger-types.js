// passenger-types.js - Enhanced passenger selection with kids and ages support

document.addEventListener('DOMContentLoaded', function() {
    // Find all booking forms
    const bookingForms = document.querySelectorAll('form.booking-form, form#bookingForm');
    
    bookingForms.forEach(form => {
        // Check if form already has enhanced passenger fields
        if (form.querySelector('.enhanced-passenger-container')) return;
        
        // Find the passengers input field
        const passengersField = form.querySelector('#passengers') || form.querySelector('[name="passengers"]');
        if (!passengersField) return;
        
        // Create enhanced passenger selection
        const passengerContainer = document.createElement('div');
        passengerContainer.className = 'form-group enhanced-passenger-container mb-4';
        
        passengerContainer.innerHTML = `
            <div class="passenger-details-card" style="
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 15px;
                padding: 1.5rem;
                border: 2px solid #FF6B35;
                margin-top: 1rem;
            ">
                <h5 style="color: #FF6B35; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-users"></i> Passenger Details
                </h5>
                
                <!-- Adults Section -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label" style="font-weight: 600; color: #2c3e50;">
                            <i class="fas fa-user" style="color: #FF6B35;"></i> Adults (13+ years)
                        </label>
                        <input type="number" class="form-control" id="numAdults" name="numAdults" 
                               value="2" min="1" max="20" style="border-radius: 10px; border: 2px solid #e9ecef;">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" style="font-weight: 600; color: #2c3e50;">
                            <i class="fas fa-child" style="color: #17a2b8;"></i> Kids (0-12 years)
                        </label>
                        <input type="number" class="form-control" id="numKids" name="numKids" 
                               value="0" min="0" max="10" style="border-radius: 10px; border: 2px solid #e9ecef;">
                    </div>
                </div>
                
                <!-- Kids Ages Section -->
                <div id="kidsAgesSection" style="display: none;">
                    <label class="form-label" style="font-weight: 600; color: #2c3e50; margin-bottom: 1rem;">
                        <i class="fas fa-birthday-cake" style="color: #ffc107;"></i> Ages of Kids
                    </label>
                    <div id="kidsAgesContainer" class="row"></div>
                    <small class="text-info" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                        <i class="fas fa-info-circle"></i>
                        Kids under 3 years travel free on most tours
                    </small>
                </div>
                
                <!-- Total Display -->
                <div class="total-passengers mt-3 p-3" style="
                    background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%);
                    color: white;
                    border-radius: 10px;
                    text-align: center;
                    font-weight: bold;
                ">
                    <i class="fas fa-calculator"></i> Total Passengers: <span id="totalPassengers">2</span>
                </div>
            </div>
        `;
        
        // Replace the original passengers field with our enhanced version
        passengersField.parentNode.replaceChild(passengerContainer, passengersField);
        
        // Get references to the new elements
        const numAdultsInput = form.querySelector('#numAdults');
        const numKidsInput = form.querySelector('#numKids');
        const kidsAgesSection = form.querySelector('#kidsAgesSection');
        const kidsAgesContainer = form.querySelector('#kidsAgesContainer');
        const totalPassengersSpan = form.querySelector('#totalPassengers');
        
        // Function to update total passengers
        function updateTotalPassengers() {
            const adults = parseInt(numAdultsInput.value) || 0;
            const kids = parseInt(numKidsInput.value) || 0;
            const total = adults + kids;
            totalPassengersSpan.textContent = total;
            
            // Update hidden passengers field for form submission
            let hiddenPassengersField = form.querySelector('#passengers');
            if (!hiddenPassengersField) {
                hiddenPassengersField = document.createElement('input');
                hiddenPassengersField.type = 'hidden';
                hiddenPassengersField.name = 'passengers';
                hiddenPassengersField.id = 'passengers';
                form.appendChild(hiddenPassengersField);
            }
            hiddenPassengersField.value = total;
        }
        
        // Function to create kids age inputs
        function updateKidsAges() {
            const numKids = parseInt(numKidsInput.value) || 0;
            
            if (numKids > 0) {
                kidsAgesSection.style.display = 'block';
                kidsAgesContainer.innerHTML = '';
                
                for (let i = 0; i < numKids; i++) {
                    const ageDiv = document.createElement('div');
                    ageDiv.className = 'col-md-4 col-sm-6 mb-2';
                    ageDiv.innerHTML = `
                        <div style="position: relative;">
                            <input type="number" class="form-control kid-age-input" 
                                   name="kidsAges[]" placeholder="Kid ${i + 1} age" 
                                   min="0" max="12" style="border-radius: 10px; border: 2px solid #e9ecef; padding-left: 2.5rem;">
                            <i class="fas fa-child" style="
                                position: absolute; 
                                left: 12px; 
                                top: 50%; 
                                transform: translateY(-50%); 
                                color: #17a2b8;
                            "></i>
                        </div>
                    `;
                    kidsAgesContainer.appendChild(ageDiv);
                }
            } else {
                kidsAgesSection.style.display = 'none';
                kidsAgesContainer.innerHTML = '';
            }
        }
        
        // Event listeners
        numAdultsInput.addEventListener('input', updateTotalPassengers);
        numKidsInput.addEventListener('input', function() {
            updateTotalPassengers();
            updateKidsAges();
        });
        
        // Initialize
        updateTotalPassengers();
        updateKidsAges();
        
        // Handle form submission to collect all passenger data
        form.addEventListener('submit', function() {
            const kidsAges = [];
            const kidAgeInputs = form.querySelectorAll('.kid-age-input');
            
            kidAgeInputs.forEach(input => {
                if (input.value) {
                    kidsAges.push(parseInt(input.value));
                }
            });
            
            // Add kids data to form
            const numKids = parseInt(numKidsInput.value) || 0;
            const numAdults = parseInt(numAdultsInput.value) || 0;
            
            // Create hidden inputs for the data
            ['numKids', 'numAdults', 'kidsAges'].forEach(field => {
                const existing = form.querySelector(`input[name="${field}"]`);
                if (existing && existing.type === 'hidden') {
                    existing.remove();
                }
            });
            
            // Add hidden fields
            const hiddenNumKids = document.createElement('input');
            hiddenNumKids.type = 'hidden';
            hiddenNumKids.name = 'numKids';
            hiddenNumKids.value = numKids;
            form.appendChild(hiddenNumKids);
            
            const hiddenNumAdults = document.createElement('input');
            hiddenNumAdults.type = 'hidden';
            hiddenNumAdults.name = 'numAdults';
            hiddenNumAdults.value = numAdults;
            form.appendChild(hiddenNumAdults);
            
            if (kidsAges.length > 0) {
                const hiddenKidsAges = document.createElement('input');
                hiddenKidsAges.type = 'hidden';
                hiddenKidsAges.name = 'kidsAges';
                hiddenKidsAges.value = JSON.stringify(kidsAges);
                form.appendChild(hiddenKidsAges);
            }
        });
    });
});