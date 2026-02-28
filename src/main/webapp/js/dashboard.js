// Fixed API BASE for standard deployment

document.addEventListener('DOMContentLoaded', function() {

    const localToken = localStorage.getItem('token');
    const localRole = localStorage.getItem('role');
    const localUser = localStorage.getItem('username');

    if (!localToken) {
        window.location.href = 'login.html';
        return;
    }

    const welcomeEl = document.getElementById('welcomeMsg');
    if(welcomeEl && localUser) {
        welcomeEl.textContent = `Welcome, ${localUser} (${localRole})`;
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

            if (localRole === 'ADMIN') {
                const adminBtnHtml = `
                    <a href="staff.html" class="flex items-center gap-2 bg-secondary hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all text-sm ml-4">
                        <span class="material-symbols-outlined text-sm">manage_accounts</span> Manage Staff
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
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400">Loading reservations...</td></tr>';

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': localToken }
            });

            if (response.ok) {
                const bookings = await response.json();
                renderTable(bookings);
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500 font-bold">Failed to load data.</td></tr>';
            }
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500 font-bold">Connection error.</td></tr>';
        }
    }

    function renderTable(bookings) {
        const tableBody = document.getElementById('bookings-table-body');
        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">No reservations found.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        bookings.forEach(b => {
            const row = document.createElement('tr');
            row.className = "hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0";

            let statusBadge = '';
            if (b.status === 'CONFIRMED') statusBadge = '<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">Confirmed</span>';
            else if (b.status === 'PENDING') statusBadge = '<span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pending</span>';
            else statusBadge = '<span class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">Cancelled</span>';

            let actionBtn = '';
            if (localRole === 'CUSTOMER') {
                if (b.status === 'CONFIRMED') actionBtn = `<a href="bill.html?id=${b.id}" target="_blank" class="inline-flex items-center gap-1 text-primary hover:text-sky-600 font-bold text-xs transition-colors"><span class="material-symbols-outlined text-sm">receipt_long</span> Bill</a>`;
            } else {
                if (b.status === 'PENDING') {
                    // Redirects to new manage-booking.html page
                    actionBtn = `<a href="manage-booking.html?id=${b.id}" class="bg-secondary hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm inline-block">Manage</a>`;
                } else if (b.status === 'CONFIRMED') {
                    actionBtn = `<span class="text-slate-500 text-xs font-mono bg-slate-100 px-2 py-1 rounded">Room ${b.roomId}</span>`;
                }
            }

            const resRef = b.reservationNumber ? b.reservationNumber : `#${b.id}`;

            row.innerHTML = `
                <td class="p-4 font-mono text-xs text-slate-500 select-all">${resRef}</td>
                <td class="p-4 font-bold text-secondary text-sm">${b.requestedType}</td>
                <td class="p-4 text-slate-500 text-xs">
                    <div class="flex flex-col">
                        <span>In: <strong>${b.checkInDate}</strong></span>
                        <span>Out: <strong>${b.checkOutDate}</strong></span>
                    </div>
                </td>
                <td class="p-4">
                    <div class="font-bold text-slate-700 text-sm">${b.guestName}</div>
                    <div class="text-xs text-slate-500 flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-[14px]">call</span> ${b.contactNumber}</div>
                    <div class="text-xs text-slate-400 flex items-start gap-1 mt-1 max-w-[200px]"><span class="material-symbols-outlined text-[14px]">location_on</span> <span class="truncate">${b.address}</span></div>
                </td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-right">${actionBtn}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});