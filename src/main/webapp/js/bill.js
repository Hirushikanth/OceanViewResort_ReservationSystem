// --- CONFIGURATION ---
const API_BASE = "/OceanView/api";
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async function() {

    // 1. Auth Check
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Get ID from URL Param
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');

    if (!bookingId) {
        showError("Invalid Reservation ID.");
        return;
    }

    // 3. Fetch Bill Data
    try {
        const response = await fetch(`${API_BASE}/billing?id=${bookingId}`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const data = await response.json();
            populateBill(data);
        } else {
            showError("Failed to load bill. Reservation may not exist.");
        }
    } catch (error) {
        showError("Connection error.");
    }

    // 4. Populate HTML
    function populateBill(data) {
        // Current Date
        document.getElementById('bill-date').textContent = "Date: " + new Date().toLocaleDateString();

        // Guest Info
        setText('res-number', data.Reservation_No);
        setText('guest-name', data.Guest_Name);
        setText('guest-address', data.Guest_Address);
        setText('guest-contact', data.Guest_Contact);

        // Details
        setText('room-type', data.Room_Type);
        setText('check-in', formatDate(data.Check_In));
        setText('check-out', formatDate(data.Check_Out));
        setText('status', data.Status);

        // Total
        setText('total-cost', data.TOTAL_AMOUNT);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if(el) el.textContent = text || "-";
    }

    // Update Error Display to use Vanilla CSS classes
    function showError(msg) {
        const container = document.getElementById('invoice-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2 style="color: var(--error); font-size: 1.5rem; margin-bottom: 1rem;">Error</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${msg}</p>
                <button onclick="window.close()" class="btn btn-secondary" style="background: var(--bg-light); color: var(--text-dark);">Close</button>
            </div>
        `;
    }

    function formatDate(dateInput) {
        if (!dateInput) return '-';

        const date = new Date(dateInput);

        // Check if valid date object
        if (isNaN(date.getTime())) return dateInput;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }
});