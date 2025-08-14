

async function saveBooking(booking) {
    try {
        // Try to save to server first
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Server request failed');
        }
    } catch (error) {
        console.warn('Server not available, using localStorage fallback:', error);
        
        // Fallback to localStorage
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        // Ensure each booking has a unique ID
        if (!booking.id) {
            booking.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return { message: 'Booking saved locally', booking };
    }
}

function attachBookingFormHandler() {
    // Support both class and id selectors for flexibility
    const forms = [
        ...document.querySelectorAll('form.booking-form'),
        ...document.querySelectorAll('form#bookingForm')
    ];
    // Remove duplicates
    const uniqueForms = Array.from(new Set(forms));
    uniqueForms.forEach(form => {
        if (form.dataset.bookingHandlerAttached) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            // Try to get all possible fields including enhanced passenger data
            const booking = {
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                tour: formData.get('tour') || formData.get('destination') || '',
                date: formData.get('date') || formData.get('travel-date') || '',
                passengers: formData.get('passengers') || '',
                message: formData.get('message') || '',
                // Enhanced passenger data
                numKids: formData.get('numKids') || formData.get('num-kids') || '0',
                numAdults: formData.get('numAdults') || formData.get('num-adults') || '2',
                kidsAboveThree: formData.get('kids-above-three') || '0',
                submitted: new Date().toISOString()
            };

            // Capture kids ages from different possible sources
            const kidsAges = [];
            
            // First try to get from JSON format (from enhanced form)
            const kidsAgesJSON = formData.get('kidsAges');
            if (kidsAgesJSON) {
                try {
                    const parsedAges = JSON.parse(kidsAgesJSON);
                    if (Array.isArray(parsedAges)) {
                        kidsAges.push(...parsedAges);
                    }
                } catch (e) {
                    console.warn('Failed to parse kidsAges JSON:', e);
                }
            }
            
            // Also try to get from individual age inputs (fallback)
            const ageInputs = form.querySelectorAll('[name^="kid-age-"], [name="kidsAges[]"], .kid-age-input');
            ageInputs.forEach(input => {
                if (input.value && input.value.trim()) {
                    const age = parseInt(input.value.trim());
                    if (!isNaN(age)) {
                        kidsAges.push(age);
                    }
                }
            });
            
            if (kidsAges.length > 0) {
                booking.kidsAges = kidsAges;
                // Count kids above 3 for pricing purposes
                const kidsAbove3 = kidsAges.filter(age => age >= 3).length;
                if (kidsAbove3 > 0) {
                    booking.kidsAboveThree = kidsAbove3.toString();
                }
            }
            try {
                const result = await saveBooking(booking);
                alert(result.message || 'Booking submitted successfully!');
                form.reset();
            } catch (error) {
                console.error('Error saving booking:', error);
                alert('Failed to submit booking. Please try again.');
            }
        });
        form.dataset.bookingHandlerAttached = 'true';
    });
}

document.addEventListener('DOMContentLoaded', attachBookingFormHandler);
