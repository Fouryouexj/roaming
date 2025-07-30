// booking-form-handler.js
// Handles all booking forms with class 'booking-form' or id 'bookingForm' in the tour folder

function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
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
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            // Try to get all possible fields
            const booking = {
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                tour: formData.get('tour') || formData.get('destination') || '',
                date: formData.get('date') || formData.get('travel-date') || '',
                passengers: formData.get('passengers') || '',
                message: formData.get('message') || '',
                submitted: new Date().toISOString()
            };
            saveBooking(booking);
            alert('Booking submitted!');
            form.reset();
        });
        form.dataset.bookingHandlerAttached = 'true';
    });
}

document.addEventListener('DOMContentLoaded', attachBookingFormHandler);
