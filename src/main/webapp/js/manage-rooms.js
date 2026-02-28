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
                msgDiv.innerHTML = '<span class="material-symbols-outlined align-middle mr-1 text-sm">check_circle</span> Room added successfully!';
                msgDiv.className = "text-xs font-bold p-3 rounded-lg bg-green-50 text-green-700 border-green-200 border block";
                this.reset();
                loadRooms(); // Refresh table
            } else {
                const data = await response.json();
                msgDiv.innerHTML = `<span class="material-symbols-outlined align-middle mr-1 text-sm">error</span> ${data.error || "Failed to add room. Room number might exist."}`;
                msgDiv.className = "text-xs font-bold p-3 rounded-lg bg-red-50 text-red-700 border-red-200 border block";
            }
        } catch (error) {
            msgDiv.innerHTML = '<span class="material-symbols-outlined align-middle mr-1 text-sm">wifi_off</span> Connection error.';
            msgDiv.className = "text-xs font-bold p-3 rounded-lg bg-red-50 text-red-700 border-red-200 border block";
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save Room';
            setTimeout(() => msgDiv.classList.add('hidden'), 4000);
        }
    });
});

// Load Room List
async function loadRooms() {
    const tableBody = document.getElementById('rooms-table-body');
    const token = localStorage.getItem('token');

    tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400">Loading inventory...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const roomList = await response.json();

            if (roomList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400">No rooms found in inventory.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';

            // Sort rooms naturally (e.g., 101, 102, 201)
            roomList.sort((a, b) => {
                const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
                return numA - numB;
            });

            roomList.forEach(room => {
                const statusBadge = room.active
                    ? `<span class="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold ring-1 ring-inset ring-green-600/20">Active</span>`
                    : `<span class="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs font-bold ring-1 ring-inset ring-slate-500/20">Inactive</span>`;

                tableBody.innerHTML += `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-4 font-bold text-secondary text-base">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-slate-300">meeting_room</span> 
                                ${room.roomNumber}
                            </div>
                        </td>
                        <td class="p-4 font-medium text-slate-700">${room.roomType}</td>
                        <td class="p-4 text-primary font-bold">$${room.pricePerNight.toFixed(2)}</td>
                        <td class="p-4">${statusBadge}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Connection error.</td></tr>';
    }
}