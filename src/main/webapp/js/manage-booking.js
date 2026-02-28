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
    document.getElementById('btn-confirm').disabled = true;

    await loadBookingDetails(bookingId);
});

async function loadBookingDetails(id) {
    try {
        // Fetch all pending bookings to find the one we need
        // (Since backend doesn't have a dedicated getBookingById for Staff yet)
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

                // Now load the rooms for this type
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
        // Fetch all rooms (No dates provided = returns all rooms)
        const response = await fetch(`${API_BASE}/rooms`, {
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const allRooms = await response.json();

            // Filter only rooms that match the requested type
            const matchingRooms = allRooms.filter(r => r.roomType === requestedType);

            if (matchingRooms.length === 0) {
                container.innerHTML = `<div class="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">No rooms exist for type: ${requestedType}</div>`;
                return;
            }

            // Group by Floor
            const floors = {};
            matchingRooms.forEach(room => {
                const floorNum = getFloorNumber(room.roomNumber);
                if (!floors[floorNum]) floors[floorNum] = [];
                floors[floorNum].push(room);
            });

            // Sort floors descending (e.g., 3rd floor at the top)
            const sortedFloorKeys = Object.keys(floors).sort((a, b) => b - a);

            container.innerHTML = ''; // Clear loading text

            sortedFloorKeys.forEach(floorKey => {
                const rooms = floors[floorKey];

                // Sort rooms numerically left to right (e.g., 101, 102, 103)
                rooms.sort((a, b) => {
                    const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });

                let floorName = floorKey == 0 ? "Ground Floor" : `Floor ${floorKey}`;

                let roomHtml = rooms.map(r => `
                    <button onclick="selectRoom(${r.id}, this)" 
                            class="room-btn w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm">
                        <span class="material-symbols-outlined mb-1">meeting_room</span>
                        <span class="font-bold text-lg leading-none">${r.roomNumber}</span>
                    </button>
                `).join('');

                container.innerHTML += `
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div class="w-24 font-bold text-slate-400 uppercase tracking-widest text-xs md:text-right shrink-0">
                            ${floorName}
                        </div>
                        <div class="flex-1 flex flex-wrap gap-3">
                            ${roomHtml}
                        </div>
                    </div>
                `;
            });

        }
    } catch (error) {
        container.innerHTML = `<div class="text-red-500 text-center">Failed to load rooms.</div>`;
    }
}

// Utility to extract floor from string (e.g., "305" -> 3)
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
        btn.classList.remove('border-primary', 'bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
        btn.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
    });

    // Highlight selected button
    btnElement.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
    btnElement.classList.add('border-primary', 'bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');

    // Enable confirm button
    document.getElementById('btn-confirm').disabled = false;

    // Clear any previous errors
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
            // Success!
            alert("Booking successfully confirmed!");
            window.location.href = 'dashboard.html';
        } else if (response.status === 409) {
            // Backend detected the room is occupied for these dates
            errorDiv.innerHTML = `<span class="material-symbols-outlined align-middle mr-1 text-lg">warning</span> 
                                  The selected room is occupied for these dates. Please suggest/select another room.`;
            errorDiv.classList.remove('hidden');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Confirm Booking`;
        } else {
            const data = await response.json();
            errorDiv.textContent = data.error || "Failed to confirm booking.";
            errorDiv.classList.remove('hidden');
            confirmBtn.disabled = false;
        }
    } catch (err) {
        errorDiv.textContent = "Server connection error.";
        errorDiv.classList.remove('hidden');
        confirmBtn.disabled = false;
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