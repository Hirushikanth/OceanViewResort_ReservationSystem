const API_URL = "api/reservations"; // Relative URL

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html"; // Redirect to login if no token
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

document.getElementById("reservationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        guestName: document.getElementById("guestName").value,
        roomType: document.getElementById("roomType").value,
        contactNumber: document.getElementById("contact").value,
        checkInDate: document.getElementById("checkIn").value,
        checkOutDate: document.getElementById("checkOut").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token // Send Token!
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Reservation Added Successfully!");
            document.getElementById("reservationForm").reset();
            loadReservations(); // Refresh table
        } else {
            alert("Failed to add reservation. Check inputs.");
        }
    } catch (err) {
        console.error(err);
        alert("Server Error");
    }
});

async function loadReservations() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": token }
        });

        if (response.status === 401) logout(); // Token expired?

        const reservations = await response.json();
        const tbody = document.getElementById("resTableBody");
        tbody.innerHTML = ""; // Clear existing rows

        reservations.forEach(res => {
            const row = `<tr>
                <td>${res.id}</td>
                <td>${res.guestName}</td>
                <td>${res.roomType}</td>
                <td>${new Date(res.checkInDate).toLocaleDateString()} to ${new Date(res.checkOutDate).toLocaleDateString()}</td>
                <td>$${res.totalCost.toFixed(2)}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Error loading data", err);
    }
}

loadReservations();