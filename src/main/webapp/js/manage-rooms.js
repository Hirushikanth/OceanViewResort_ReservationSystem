const API_BASE = "/OceanView/api";

document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // SECURITY CHECK: Only Admins allowed here
    if (!token || role !== 'ADMIN') {
        alert("Access Denied. Admins only.");
        window.location.href = 'dashboard.html';
        return;
    }

    // Load table on start
    loadRooms();

    // Handle Form Submit
    document.getElementById('room-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const roomNumber = document.getElementById('roomNumber').value.trim();
        const roomType = document.getElementById('roomType').value.trim();
        const pricePerNight = parseFloat(document.getElementById('pricePerNight').value);

        const msgDiv = document.getElementById('form-msg');
        const btn = this.querySelector('button');

        btn.disabled = true;
        btn.classList.add('btn-disabled');
        btn.innerHTML = 'Saving...';

        try {
            const response = await fetch(`${API_BASE}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    roomNumber: roomNumber,
                    roomType: roomType,
                    pricePerNight: pricePerNight
                })
            });

            if (response.ok) {
                msgDiv.innerHTML = 'Room added successfully!';
                msgDiv.className = "alert alert-success";
                this.reset();
                loadRooms(); // Refresh table
            } else {
                const data = await response.json();
                msgDiv.innerHTML = data.error || "Failed to add room.";
                msgDiv.className = "alert alert-error";
            }
        } catch (error) {
            msgDiv.innerHTML = 'Connection error.';
            msgDiv.className = "alert alert-error";
        } finally {
            msgDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.classList.remove('btn-disabled');
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save Room';
            setTimeout(() => msgDiv.classList.add('hidden'), 4000);
        }
    });
});

// Load Room List
async function loadRooms() {
    const tableBody = document.getElementById('rooms-table-body');
    const token = localStorage.getItem('token');

    tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">Loading inventory...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const roomList = await response.json();

            if (roomList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">No rooms found in inventory.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';

            // Sort rooms naturally
            roomList.sort((a, b) => {
                const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
                return numA - numB;
            });

            roomList.forEach(room => {
                const statusBadge = room.active
                    ? `<span class="badge badge-active">Active</span>`
                    : `<span class="badge badge-inactive">Inactive</span>`;

                tableBody.innerHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--secondary);">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="material-symbols-outlined" style="color: var(--text-muted); font-size: 1.25rem;">meeting_room</span> 
                                ${room.roomNumber}
                            </div>
                        </td>
                        <td>${room.roomType}</td>
                        <td style="font-weight: 700; color: var(--primary);">$${room.pricePerNight.toFixed(2)}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--error);">Connection error.</td></tr>';
    }
}