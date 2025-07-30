// corp-booking.js - Handles corporate booking form and admin panel integration

// Utility: Save corporate booking to localStorage
function saveCorpBooking(booking) {
    let corpBookings = JSON.parse(localStorage.getItem('corpBookings') || '[]');
    corpBookings.push(booking);
    localStorage.setItem('corpBookings', JSON.stringify(corpBookings));
}

// Utility: Get all corporate bookings
function getCorpBookings() {
    return JSON.parse(localStorage.getItem('corpBookings') || '[]');
}

// Attach handler to corporate booking form (form id: corpBookingForm)
function attachCorpBookingFormHandler() {
    const form = document.getElementById('corpBookingForm');
    if (!form || form.dataset.corpBookingHandlerAttached) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const booking = {
            company: formData.get('company') || '',
            contact: formData.get('contact') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            service: formData.get('service') || '',
            date: formData.get('date') || '',
            passengers: formData.get('passengers') || '',
            message: formData.get('message') || '',
            submitted: new Date().toISOString()
        };
        saveCorpBooking(booking);
        alert('Corporate booking submitted successfully!');
        form.reset();
    });
    form.dataset.corpBookingHandlerAttached = 'true';
}

// Render corporate bookings in admin panel (section id: corp-bookings-section)
function renderCorpBookings() {
    const section = document.getElementById('corp-bookings-section');
    if (!section) return;
    const bookings = getCorpBookings();
    let html = '';
    if (bookings.length === 0) {
        html = '<div class=\"empty-message\">No corporate bookings yet.</div>';
    } else {
        html = `<table class=\"table table-striped table-bordered\">
            <thead><tr>
                <th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Service</th><th>Date</th><th>Passengers</th><th>Message</th><th>Submitted</th>
            </tr></thead><tbody>`;
        bookings.forEach(b => {
            html += `<tr>
                <td>${b.company}</td>
                <td>${b.contact}</td>
                <td>${b.email}</td>
                <td>${b.phone}</td>
                <td>${b.service}</td>
                <td>${b.date}</td>
                <td>${b.passengers}</td>
                <td>${b.message}</td>
                <td>${formatDateTime(b.submitted)}</td>
            </tr>`;
        });
        html += '</tbody></table>';
    }
    section.innerHTML = html;
}

// Format ISO date string to readable format
function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
}

// Add this function to your corp-booking.js file
function markCorpBookingResolved(index) {
    let corpBookings = JSON.parse(localStorage.getItem('corpBookings') || '[]');
    if (corpBookings[index]) {
        corpBookings[index].resolved = true;
        corpBookings[index].resolvedDate = new Date().toISOString();
        localStorage.setItem('corpBookings', JSON.stringify(corpBookings));
        renderCorpBookings();
        if (window.showAdminToast) {
            showAdminToast('Corporate booking marked as resolved!', 'success');
        }
    }
}

// For admin panel: re-render on tab switch if needed
window.renderCorpBookings = renderCorpBookings;
