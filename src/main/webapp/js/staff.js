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
    loadStaff();

    // Handle Form Submit
    document.getElementById('staff-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('staffUser').value;
        const passwordHash = document.getElementById('staffPass').value;
        const confirmPass = document.getElementById('staffPassConfirm').value;

        const msgDiv = document.getElementById('form-msg');
        const btn = this.querySelector('button');

        // Check password match
        if (passwordHash !== confirmPass) {
            msgDiv.textContent = "Error: Passwords do not match!";
            msgDiv.className = "alert alert-error";
            msgDiv.classList.remove('hidden');

            document.getElementById('staffPass').value = '';
            document.getElementById('staffPassConfirm').value = '';
            document.getElementById('staffPass').focus();

            setTimeout(() => msgDiv.classList.add('hidden'), 3000);
            return;
        }

        btn.disabled = true;
        btn.classList.add('btn-disabled');
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
                msgDiv.className = "alert alert-success";
                this.reset();
                loadStaff(); // Refresh table
            } else {
                const data = await response.json();
                msgDiv.textContent = data.error || "Failed to create staff.";
                msgDiv.className = "alert alert-error";
            }
        } catch (error) {
            msgDiv.textContent = "Connection error.";
            msgDiv.className = "alert alert-error";
        } finally {
            msgDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.classList.remove('btn-disabled');
            btn.innerHTML = 'Create Staff Account';
            setTimeout(() => msgDiv.classList.add('hidden'), 3000);
        }
    });
});

// Load Staff List
async function loadStaff() {
    const tableBody = document.getElementById('staff-table-body');
    const token = localStorage.getItem('token');

    tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const staffList = await response.json();

            if (staffList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">No staff members found.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';
            staffList.forEach(staff => {
                tableBody.innerHTML += `
                    <tr>
                        <td class="text-muted" style="font-family: monospace;">#${staff.id}</td>
                        <td style="font-weight: 700;">${staff.username}</td>
                        <td>
                            <span class="badge" style="background-color: var(--primary); color: white;">STAFF</span>
                        </td>
                        <td class="text-right">
                            <button onclick="deleteStaff(${staff.id})" class="btn btn-danger" style="padding: 0.25rem 0.5rem;" title="Remove Staff">
                                <span class="material-symbols-outlined" style="font-size: 1.25rem;">delete</span>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--error);">Connection error.</td></tr>';
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