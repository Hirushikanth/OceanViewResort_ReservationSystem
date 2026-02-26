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
        setText('check-in', data.Check_In);
        setText('check-out', data.Check_Out);
        setText('status', data.Status);

        // Total
        setText('total-cost', data.TOTAL_AMOUNT);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if(el) el.textContent = text || "-";
    }

    function showError(msg) {
        const container = document.getElementById('invoice-container');
        container.innerHTML = `
            <div class="text-center p-12">
                <h2 class="text-2xl font-bold text-red-500 mb-2">Error</h2>
                <p class="text-slate-600">${msg}</p>
                <button onclick="window.close()" class="mt-6 bg-slate-200 px-4 py-2 rounded-lg font-bold">Close</button>
            </div>
        `;
    }
});