const API_BASE = "/OceanViewResort/api";

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
    loadStaff();

    // Handle Form Submit
    document.getElementById('staff-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('staffUser').value;
        const passwordHash = document.getElementById('staffPass').value;
        const msgDiv = document.getElementById('form-msg');
        const btn = this.querySelector('button');

        btn.disabled = true;
        btn.innerHTML = 'Creating...';

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    username: username,
                    passwordHash: passwordHash,
                    role: 'STAFF' // Explicitly set role
                })
            });

            if (response.ok) {
                msgDiv.textContent = "Staff created successfully!";
                msgDiv.className = "text-xs font-bold p-2 rounded bg-green-50 text-green-600 block";
                this.reset();
                loadStaff(); // Refresh table
            } else {
                const data = await response.json();
                msgDiv.textContent = data.error || "Failed to create staff (Username exists?)";
                msgDiv.className = "text-xs font-bold p-2 rounded bg-red-50 text-red-600 block";
            }
        } catch (error) {
            msgDiv.textContent = "Connection error.";
            msgDiv.className = "text-xs font-bold p-2 rounded bg-red-50 text-red-600 block";
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Create Staff Account';
            setTimeout(() => msgDiv.classList.add('hidden'), 3000);
        }
    });
});

// Load Staff List
async function loadStaff() {
    const tableBody = document.getElementById('staff-table-body');
    const token = localStorage.getItem('token');

    tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const staffList = await response.json();

            if (staffList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400">No staff members found.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';
            staffList.forEach(staff => {
                tableBody.innerHTML += `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-4 text-slate-500 font-mono text-xs">#${staff.id}</td>
                        <td class="p-4 font-bold text-slate-700">${staff.username}</td>
                        <td class="p-4">
                            <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">STAFF</span>
                        </td>
                        <td class="p-4 text-right">
                            <button onclick="deleteStaff(${staff.id})" class="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Remove Staff">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-red-500">Connection error.</td></tr>';
    }
}

// Delete Staff
async function deleteStaff(id) {
    if (!confirm("Are you sure you want to completely remove this staff member?")) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/users?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            alert("Staff removed.");
            loadStaff(); // Refresh table
        } else {
            alert("Failed to delete staff.");
        }
    } catch (error) {
        alert("Connection error.");
    }
}