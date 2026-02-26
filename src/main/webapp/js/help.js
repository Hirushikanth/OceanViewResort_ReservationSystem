const API_BASE = "/OceanView/api";

document.addEventListener('DOMContentLoaded', async function() {
    const contentDiv = document.getElementById('help-content');

    try {
        const response = await fetch(`${API_BASE}/help`);
        if (response.ok) {
            const data = await response.json();
            renderHelp(data);
        } else {
            contentDiv.innerHTML = '<p class="text-red-500">Failed to load help guide.</p>';
        }
    } catch (error) {
        contentDiv.innerHTML = '<p class="text-red-500">Connection error.</p>';
    }

    function renderHelp(data) {
        contentDiv.innerHTML = '';

        // Data comes as a Map { "1. Login": "Description..." }
        for (const [title, desc] of Object.entries(data)) {
            // Skip the TITLE key if present in map
            if(title === "TITLE") continue;

            const item = document.createElement('div');
            item.className = "border-b border-slate-100 pb-4 last:border-0";

            item.innerHTML = `
                <h3 class="text-lg font-bold text-slate-800 mb-1">${title}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${desc}</p>
            `;
            contentDiv.appendChild(item);
        }
    }
});