document.addEventListener('DOMContentLoaded', function() {

    const localToken = localStorage.getItem('token');
    const localRole = localStorage.getItem('role');
    const localUser = localStorage.getItem('username');

    // Security Check
    if (!localToken) {
        window.location.href = 'login.html';
        return;
    }

    // Welcome Message
    const welcomeEl = document.getElementById('welcomeMsg');
    if(welcomeEl && localUser) {
        welcomeEl.textContent = `Welcome, ${localUser} (${localRole})`;
        welcomeEl.classList.remove('hidden');
    }

    // --- SETUP UI BASED ON ROLE ---
    if (localRole === 'CUSTOMER') {
        const custActions = document.getElementById('customer-actions');
        if(custActions) custActions.classList.remove('hidden');
        loadBookings('/bookings');
    } else {
        const staffActions = document.getElementById('staff-actions');
        if(staffActions) {
            staffActions.classList.remove('hidden');

            // Admin Buttons
            if (localRole === 'ADMIN') {
                const adminBtnHtml = `
                    <a href="manage-rooms.html" class="btn btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">bed</span> Manage Rooms
                    </a>
                    <a href="staff.html" class="btn btn-primary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">manage_accounts</span> Manage Staff
                    </a>
                `;
                staffActions.insertAdjacentHTML('beforeend', adminBtnHtml);
            }
        }

        loadBookings('/bookings?status=PENDING');

        const statusFilter = document.getElementById('statusFilter');
        if(statusFilter) {
            statusFilter.addEventListener('change', function() {
                const status = this.value;
                const endpoint = status === 'ALL' ? '/bookings' : `/bookings?status=${status}`;
                loadBookings(endpoint);
            });
        }
    }

    async function loadBookings(endpoint) {
        const tableBody = document.getElementById('bookings-table-body');
        if(!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">Loading reservations...</td></tr>';

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': localToken }
            });

            if (response.ok) {
                const bookings = await response.json();
                renderTable(bookings);
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--error);">Failed to load data.</td></tr>';
            }
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--error);">Connection error.</td></tr>';
        }
    }

    function renderTable(bookings) {
        const tableBody = document.getElementById('bookings-table-body');

        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem; font-style: italic;">No reservations found.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        bookings.forEach(b => {
            const row = document.createElement('tr');

            // Status Badge Logic
            let statusBadge = '';
            if (b.status === 'CONFIRMED') statusBadge = '<span class="badge badge-confirmed">Confirmed</span>';
            else if (b.status === 'PENDING') statusBadge = '<span class="badge badge-pending">Pending</span>';
            else statusBadge = '<span class="badge badge-cancelled">Cancelled</span>';

            // Action Buttons Logic
            let actionBtn = '';
            if (localRole === 'CUSTOMER') {
                if (b.status === 'CONFIRMED') {
                    actionBtn = `<a href="bill.html?id=${b.id}" target="_blank" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">receipt_long</span> Bill
                                 </a>`;
                }
            } else {
                if (b.status === 'PENDING') {
                    actionBtn = `<a href="manage-booking.html?id=${b.id}" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;">Manage</a>`;
                } else if (b.status === 'CONFIRMED') {
                    actionBtn = `<span class="badge badge-inactive" style="font-family: monospace;">Room ${b.roomId}</span>`;
                }
            }

            const resRef = b.reservationNumber ? b.reservationNumber : `#${b.id}`;

            // Injecting HTML with Clean CSS Styles
            row.innerHTML = `
                <td style="font-family: monospace; color: var(--text-muted);">${resRef}</td>
                <td style="font-weight: 700; color: var(--primary);">${b.requestedType}</td>
                <td style="font-size: 0.875rem;">
                    <div style="display: flex; flex-direction: column;">
                        <!-- UPDATED: Added formatDate() -->
                        <span>In: <strong>${formatDate(b.checkInDate)}</strong></span>
                        <span>Out: <strong>${formatDate(b.checkOutDate)}</strong></span>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 700;">${b.guestName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                        <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">call</span> ${b.contactNumber}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                        <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">location_on</span> ${b.address}
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td class="text-right">${actionBtn}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- HELPER: DATE FORMATTER ---
    function formatDate(dateInput) {
        if (!dateInput) return '-';

        const date = new Date(dateInput);

        // Check if valid date object
        if (isNaN(date.getTime())) return dateInput;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

});