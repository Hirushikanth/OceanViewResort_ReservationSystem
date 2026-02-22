const API_BASE = "api/";

function redirectBasedOnRole(role) {
    if (role === 'ADMIN') window.location.href = 'admin-dash.html';
    else if (role === 'STAFF') window.location.href = 'staff-dash.html';
    else window.location.href = 'customer-dash.html';
}

function requireAuth(allowedRoles) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        logoutAndRedirect();
        return null;
    }

    if (!allowedRoles.includes(role)) {
        alert("Access Denied: You do not have permission to view this page.");
        redirectBasedOnRole(role);
        return null;
    }

    return { token, role };
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");

    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = token;
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        alert("Session expired. Please login again.");
        logoutAndRedirect();
        throw new Error("Session Expired");
    }

    return response;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "index.html";
}