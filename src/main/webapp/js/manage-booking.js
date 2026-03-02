const API_BASE = "/OceanView/api";
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

let currentBooking = null;
let selectedRoomId = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Security check
    if (!token || role === 'CUSTOMER') {
        window.location.href = 'dashboard.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');

    if (!bookingId) {
        alert("No booking ID provided.");
        window.location.href = 'dashboard.html';
        return;
    }

    // Disable confirm button initially
    const confirmBtn = document.getElementById('btn-confirm');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('btn-disabled');

    await loadBookingDetails(bookingId);
});

async function loadBookingDetails(id) {
    try {
        // Fetch all pending bookings
        const response = await fetch(`${API_BASE}/bookings?status=PENDING`, {
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const bookings = await response.json();
            currentBooking = bookings.find(b => b.id == id);

            if (currentBooking) {
                // Populate UI
                document.getElementById('b-guest-name').textContent = currentBooking.guestName;
                document.getElementById('b-contact').textContent = currentBooking.contactNumber;
                document.getElementById('b-type').textContent = currentBooking.requestedType;
                document.getElementById('display-type').textContent = currentBooking.requestedType;
                document.getElementById('b-checkin').textContent = currentBooking.checkInDate;
                document.getElementById('b-checkout').textContent = currentBooking.checkOutDate;

                // Load Floor Plan
                await loadFloorPlan(currentBooking.requestedType);
            } else {
                alert("Booking not found or already processed.");
                window.location.href = 'dashboard.html';
            }
        }
    } catch (error) {
        console.error("Failed to load booking details", error);
    }
}

async function loadFloorPlan(requestedType) {
    const container = document.getElementById('floor-plan-container');

    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const allRooms = await response.json();

            // Filter rooms by type
            const matchingRooms = allRooms.filter(r => r.roomType === requestedType);

            if (matchingRooms.length === 0) {
                container.innerHTML = `<div class="alert alert-error text-center">No rooms exist for type: ${requestedType}</div>`;
                return;
            }

            // Group by Floor
            const floors = {};
            matchingRooms.forEach(room => {
                const floorNum = getFloorNumber(room.roomNumber);
                if (!floors[floorNum]) floors[floorNum] = [];
                floors[floorNum].push(room);
            });

            // Sort floors descending
            const sortedFloorKeys = Object.keys(floors).sort((a, b) => b - a);

            container.innerHTML = ''; // Clear loading text

            sortedFloorKeys.forEach(floorKey => {
                const rooms = floors[floorKey];

                // Sort rooms numerically
                rooms.sort((a, b) => {
                    const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });

                let floorName = floorKey == 0 ? "Ground Floor" : `Floor ${floorKey}`;

                // Generate Room Buttons with Vanilla CSS Classes
                let roomHtml = rooms.map(r => `
                    <button onclick="selectRoom(${r.id}, this)" class="room-btn">
                        <span class="material-symbols-outlined" style="margin-bottom: 0.25rem;">meeting_room</span>
                        <span style="font-weight: 700; line-height: 1;">${r.roomNumber}</span>
                    </button>
                `).join('');

                container.innerHTML += `
                    <div class="floor-section">
                        <div class="floor-label">${floorName}</div>
                        <div class="room-grid">
                            ${roomHtml}
                        </div>
                    </div>
                `;
            });

        }
    } catch (error) {
        container.innerHTML = `<div class="alert alert-error text-center">Failed to load rooms.</div>`;
    }
}

// Utility to extract floor number
function getFloorNumber(roomStr) {
    const num = parseInt(roomStr.replace(/\D/g, ''));
    if (isNaN(num)) return 0;
    if (num < 100) return 0; // Ground floor
    return Math.floor(num / 100);
}

// Handle Room Selection UI
function selectRoom(roomId, btnElement) {
    selectedRoomId = roomId;

    // Reset all buttons
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Highlight selected button
    btnElement.classList.add('selected');

    // Enable confirm button
    const confirmBtn = document.getElementById('btn-confirm');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('btn-disabled');

    // Clear errors
    const errorDiv = document.getElementById('action-error');
    errorDiv.classList.add('hidden');
}

// API Call: Confirm Booking
async function confirmBooking() {
    if (!currentBooking || !selectedRoomId) return;

    const errorDiv = document.getElementById('action-error');
    const confirmBtn = document.getElementById('btn-confirm');

    errorDiv.classList.add('hidden');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('btn-disabled');
    confirmBtn.innerHTML = "Checking availability...";

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                id: currentBooking.id,
                status: 'CONFIRMED',
                roomId: selectedRoomId
            })
        });

        if (response.ok) {
            alert("Booking successfully confirmed!");
            window.location.href = 'dashboard.html';
        } else if (response.status === 409) {
            errorDiv.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 4px;">warning</span> 
                                  The selected room is occupied for these dates.`;
            errorDiv.classList.remove('hidden');
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-disabled');
            confirmBtn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Confirm Booking`;
        } else {
            const data = await response.json();
            errorDiv.textContent = data.error || "Failed to confirm booking.";
            errorDiv.classList.remove('hidden');
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-disabled');
        }
    } catch (err) {
        errorDiv.textContent = "Server connection error.";
        errorDiv.classList.remove('hidden');
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('btn-disabled');
    }
}

// API Call: Reject Booking
async function rejectBooking() {
    if (!currentBooking) return;

    if (!confirm(`Are you sure you want to completely CANCEL the booking for ${currentBooking.guestName}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                id: currentBooking.id,
                status: 'CANCELLED'
            })
        });

        if (response.ok) {
            alert("Booking rejected and cancelled.");
            window.location.href = 'dashboard.html';
        } else {
            alert("Failed to cancel booking.");
        }
    } catch (err) {
        alert("Server error.");
    }
}