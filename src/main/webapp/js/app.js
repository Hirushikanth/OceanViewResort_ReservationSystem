// --- CONFIGURATION ---
const API_BASE = "/OceanView/api";

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. GLOBAL AUTH CHECK ---
    const token = localStorage.getItem('token');
    // const role = localStorage.getItem('role'); // Not used yet
    const currentPath = window.location.pathname;

    // Check if user is logged in (skip for index/login)
    if (!currentPath.endsWith('index.html') && !currentPath.endsWith('login.html') && !currentPath.endsWith('/')) {
        if (!token) {
            window.location.href = 'login.html';
            return; // Stop execution
        }
    }

    // --- 2. LOGOUT LOGIC ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if(confirm("Are you sure you want to logout?")) {
                fetch(`${API_BASE}/login`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token }
                }).finally(() => {
                    localStorage.clear();
                    window.location.href = 'index.html';
                });
            }
        });
    }

    // --- 3. BOOKING PAGE LOGIC ---
    const bookingForm = document.getElementById('booking-form');

    if (bookingForm) {
        // A. Load Room Types Dynamically
        loadRoomTypes();

        // B. Set Date Constraints (Min = Today)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkInDate').setAttribute('min', today);
        document.getElementById('checkOutDate').setAttribute('min', today);

        // C. Handle Submission
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // --- HELPER FUNCTIONS ---

    async function loadRoomTypes() {
        const typeSelect = document.getElementById('requestedType');
        try {
            // Note: GET /api/rooms returns a list of rooms.
            // In Phase 3 backend we made it return types for customers.
            // Ensure you are sending the token!
            const response = await fetch(`${API_BASE}/rooms`, {
                method: 'GET',
                headers: { 'Authorization': token }
            });

            if (response.ok) {
                const rooms = await response.json();
                typeSelect.innerHTML = '<option value="" disabled selected>Select Room Type</option>';

                // We expect a list of objects with { roomType: "Deluxe", pricePerNight: 250.0 }
                // Since the backend might return multiple rooms of same type, let's dedup logic here if needed,
                // BUT your backend logic `roomDAO.getRoomTypes()` already returns DISTINCT types.

                rooms.forEach(room => {
                    const opt = document.createElement('option');
                    opt.value = room.roomType;
                    opt.textContent = `${room.roomType} ($${room.pricePerNight}/night)`;
                    typeSelect.appendChild(opt);
                });
            } else {
                typeSelect.innerHTML = '<option value="" disabled>Error loading rooms</option>';
            }
        } catch (error) {
            console.error("Failed to load rooms", error);
            typeSelect.innerHTML = '<option value="" disabled>Connection Error</option>';
        }
    }

    async function handleBookingSubmit(e) {
        e.preventDefault();

        const errorDiv = document.getElementById('form-error');
        const successDiv = document.getElementById('form-success');
        const submitBtn = this.querySelector('button[type="submit"]');

        // Reset Messages
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');

        // Disable Button
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        submitBtn.innerHTML = 'Processing...';

        // 1. Get Values
        const guestName = document.getElementById('guestName').value;
        const address = document.getElementById('address').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const requestedType = document.getElementById('requestedType').value;
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;

        // 2. Validate Dates
        if (!checkInDate || !checkOutDate) {
            showError("Please select both Check-In and Check-Out dates.");
            resetBtn(submitBtn, originalBtnText);
            return;
        }

        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            showError("Check-Out date must be AFTER Check-In date.");
            resetBtn(submitBtn, originalBtnText);
            return;
        }

        // 3. Prepare Payload
        const payload = {
            guestName,
            address,
            contactNumber,
            requestedType,
            checkInDate,
            checkOutDate
        };

        try {
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.innerHTML = `<strong>Success!</strong> Booking requested.<br>Est. Cost: $${data.estimatedCost}`;
                successDiv.classList.remove('hidden');
                document.getElementById('booking-form').reset();

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showError(data.error || "Booking failed.");
            }
        } catch (err) {
            showError("Server connection error.");
        } finally {
            if(!successDiv.classList.contains('hidden')) {
                // Keep disabled on success
            } else {
                resetBtn(submitBtn, originalBtnText);
            }
        }

        function showError(msg) {
            errorDiv.textContent = msg;
            errorDiv.classList.remove('hidden');
        }
    }

    function resetBtn(btn, html) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.innerHTML = html;
    }

});