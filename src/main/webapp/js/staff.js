// 1. Security Check
const auth = requireAuth(['STAFF']);

if (auth) {
    loadAllBookings();
    loadStaff();
}

async function loadAllBookings() {
    try {
        const response = await fetchWithAuth('api/bookings');
        const bookings = await response.json();

        const tbody = document.getElementById("staffBookingsTable");
        tbody.innerHTML = "";

        let revenue = 0;

        bookings.forEach(b => {
            if(b.status === 'CONFIRMED') revenue += b.totalCost;

            let actionHTML = '';
            if (b.status === 'PENDING') {
                actionHTML = `
                    <button onclick="updateStatus(${b.id}, 'CONFIRMED')" style="background:green; padding:5px;">Confirm</button>
                    <button onclick="updateStatus(${b.id}, 'CANCELLED')" style="background:red; padding:5px;">Cancel</button>
                `;
            } else {
                actionHTML = `<span>${b.status}</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${b.id}</td>
                    <td>${b.customerId}</td>
                    <td>${b.roomId}</td>
                    <td>${new Date(b.checkInDate).toLocaleDateString()} - ${new Date(b.checkOutDate).toLocaleDateString()}</td>
                    <td>$${b.totalCost}</td>
                    <td>${b.status}</td>
                    <td>${actionHTML}</td>
                </tr>
            `;
        });

        document.getElementById("totalRevenue").innerText = "$" + revenue.toFixed(2);
    } catch (e) {
        console.error(e);
    }
}

async function updateStatus(id, newStatus) {
    if(!confirm(`Mark booking #${id} as ${newStatus}?`)) return;

    try {
        const response = await fetchWithAuth('api/bookings', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: id, status: newStatus })
        });

        if(response.ok) {
            loadAllBookings(); // Refresh UI
        } else {
            alert("Failed to update status");
        }
    } catch (e) {
        console.error(e);
    }
}