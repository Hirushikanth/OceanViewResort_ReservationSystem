// 1. Security Check: Only CUSTOMER can be here
const auth = requireAuth(['CUSTOMER']);

// 2. Load Bookings on startup
if (auth) {
    loadMyBookings();
}

// 3. Search Available Rooms
async function searchRooms() {
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!checkIn || !checkOut || checkIn >= checkOut) {
        alert("Please select valid dates. Check-out must be after Check-in.");
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
        const rooms = await response.json();

        const tbody = document.getElementById("roomsBody");
        tbody.innerHTML = "";

        if (rooms.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No rooms available for these dates.</td></tr>";
        } else {
            rooms.forEach(r => {
                tbody.innerHTML += `
                    <tr>
                        <td>${r.roomNumber}</td>
                        <td>${r.roomType}</td>
                        <td>$${r.pricePerNight}</td>
                        <td>
                            <button onclick="bookRoom(${r.id}, '${checkIn}', '${checkOut}')">Book Now</button>
                        </td>
                    </tr>
                `;
            });
        }
        document.getElementById("roomsTable").style.display = "table";
    } catch (e) {
        console.error("Search failed", e);
    }
}

// 4. Book a Room
async function bookRoom(roomId, checkIn, checkOut) {
    const data = {
        roomId: roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut
    };

    try {
        const response = await fetchWithAuth(API_BASE + 'bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message + "\nEstimated Cost: $" + result.estimatedCost);

            // Clear search and reload bookings
            document.getElementById("roomsTable").style.display = "none";
            document.getElementById("checkIn").value = "";
            document.getElementById("checkOut").value = "";
            loadMyBookings();
        } else {
            alert("Failed to book room.");
        }
    } catch (e) {
        console.error("Booking failed", e);
    }
}

// 5. Load Customer's Bookings
async function loadMyBookings() {
    try {
        const response = await fetchWithAuth(API_BASE + 'bookings');

        const bookings = await response.json();
        const tbody = document.getElementById("myBookingsBody");
        tbody.innerHTML = "";

        bookings.forEach(b => {
            // Color code the status
            let color = b.status === 'PENDING' ? 'orange' : (b.status === 'CONFIRMED' ? 'green' : 'red');

            tbody.innerHTML += `
                <tr>
                    <td>${b.id}</td>
                    <td>${new Date(b.checkInDate).toLocaleDateString()}</td>
                    <td>${new Date(b.checkOutDate).toLocaleDateString()}</td>
                    <td>$${b.totalCost}</td>
                    <td style="color: ${color}; font-weight: bold;">${b.status}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Failed to load bookings", e);
    }
}