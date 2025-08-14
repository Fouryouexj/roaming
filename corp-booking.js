// corp-booking.js - Handles corporate booking form and admin panel integration

// Utility: Save corporate booking to server or localStorage
async function saveCorpBooking(booking) {
    try {
        const response = await fetch('/api/corp-bookings', {
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
        let corpBookings = JSON.parse(localStorage.getItem('corpBookings') || '[]');
        booking.id = Date.now().toString();
        booking.submitted = new Date().toISOString();
        corpBookings.push(booking);
        localStorage.setItem('corpBookings', JSON.stringify(corpBookings));
        return { message: 'Corporate booking saved locally', corpBooking: booking };
    }
}

// Utility: Get all corporate bookings
async function getCorpBookings() {
    try {
        const response = await fetch('/api/corp-bookings');
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Server request failed');
        }
    } catch (error) {
        console.warn('Server not available, using localStorage fallback:', error);
        return JSON.parse(localStorage.getItem('corpBookings') || '[]');
    }
}

// Attach handler to corporate booking form (form id: corpBookingForm)
function attachCorpBookingFormHandler() {
    const form = document.getElementById('corpBookingForm');
    if (!form || form.dataset.corpBookingHandlerAttached) return;
    form.addEventListener('submit', async function(e) {
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
        
        try {
            const result = await saveCorpBooking(booking);
            alert(result.message || 'Corporate booking submitted successfully!');
            form.reset();
        } catch (error) {
            console.error('Error saving corporate booking:', error);
            alert('Failed to submit corporate booking. Please try again.');
        }
    });
    form.dataset.corpBookingHandlerAttached = 'true';
}

// Render corporate bookings in admin panel (section id: corp-bookings-section)
async function renderCorpBookings() {
    const section = document.getElementById('corp-bookings-section');
    if (!section) return;
    
    try {
        const bookings = await getCorpBookings();
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
                    <td>${b.company || 'N/A'}</td>
                    <td>${b.contact || 'N/A'}</td>
                    <td>${b.email || 'N/A'}</td>
                    <td>${b.phone || 'N/A'}</td>
                    <td>${b.service || 'N/A'}</td>
                    <td>${b.date || 'N/A'}</td>
                    <td>${b.passengers || 'N/A'}</td>
                    <td>${b.message || 'N/A'}</td>
                    <td>${formatDateTime(b.submitted)}</td>
                </tr>`;
            });
            html += '</tbody></table>';
        }
        section.innerHTML = html;
    } catch (error) {
        console.error('Error rendering corporate bookings:', error);
        section.innerHTML = '<div class=\"error-message\">Error loading corporate bookings</div>';
    }
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

const CorpBookingService = {
    async getAll() {
        const res = await fetch('/api/corp-bookings');
        if (!res.ok) return [];
        return await res.json();
    },
    async add(booking) {
        const res = await fetch('/api/corp-bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        if (!res.ok) throw new Error('Failed to submit corporate booking');
        return await res.json();
    }
};

// For admin panel: re-render on tab switch if needed
window.renderCorpBookings = renderCorpBookings;
