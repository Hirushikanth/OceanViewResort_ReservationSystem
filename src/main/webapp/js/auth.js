// --- CONFIGURATION ---
const API_BASE = "/OceanView/api";

// --- REGEX PATTERNS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// --- GLOBAL FUNCTIONS (Must be accessible by HTML onclick) ---

function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        loginTab.className = "flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary transition-colors";
        regTab.className = "flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors";
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        regTab.className = "flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary transition-colors";
        loginTab.className = "flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors";
    }
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
    } else {
        input.type = "password";
        icon.textContent = "visibility";
    }
}

// --- EVENT LISTENERS (Wait for DOM Content Loaded) ---
document.addEventListener('DOMContentLoaded', function() {

    // --- HELPER: Validation UI ---
    function setValidationStatus(input, isValid) {
        const parent = input.parentElement;
        const errorMsg = parent.querySelector('.validation-msg');
        const checkIcon = parent.querySelector('.check-icon');

        if (isValid) {
            input.classList.remove('error-ring');
            input.classList.add('success-ring');
            if(errorMsg) errorMsg.style.display = 'none';
            if(checkIcon) checkIcon.style.display = 'block';
        } else {
            input.classList.remove('success-ring');
            input.classList.add('error-ring');
            if(errorMsg) errorMsg.style.display = 'block';
            if(checkIcon) checkIcon.style.display = 'none';
        }
    }

    // --- 1. Email Validation (On Blur) ---
    const regUser = document.getElementById('reg-username');
    if(regUser) {
        regUser.addEventListener('blur', function() {
            setValidationStatus(this, EMAIL_REGEX.test(this.value));
        });
    }

    // --- 2. Password Validation (On Blur) ---
    const regPass = document.getElementById('reg-password');
    if(regPass) {
        regPass.addEventListener('blur', function() {
            setValidationStatus(this, PASS_REGEX.test(this.value));

            // Re-check confirmation if needed
            const confirmInput = document.getElementById('reg-confirm');
            if(confirmInput.value !== "") {
                setValidationStatus(confirmInput, confirmInput.value === this.value);
            }
        });
    }

    // --- 3. Confirm Password Validation (On Blur) ---
    const regConfirm = document.getElementById('reg-confirm');
    if(regConfirm) {
        regConfirm.addEventListener('blur', function() {
            const mainPass = document.getElementById('reg-password').value;
            setValidationStatus(this, this.value === mainPass && this.value !== "");
        });
    }

    // --- API: LOGIN HANDLER ---
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userField = document.getElementById('login-username');
            const passField = document.getElementById('login-password');
            const errorDiv = document.getElementById('login-error');

            if(!userField.value || !passField.value) {
                errorDiv.textContent = "Both fields are mandatory.";
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userField.value,
                        passwordHash: passField.value
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('userId', data.id);
                    localStorage.setItem('username', userField.value);
                    window.location.href = 'dashboard.html';
                } else {
                    errorDiv.textContent = data.message || "Invalid credentials";
                    errorDiv.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                errorDiv.textContent = "Server connection error.";
                errorDiv.classList.remove('hidden');
            }
        });
    }

    // --- API: REGISTER HANDLER ---
    const regForm = document.getElementById('register-form');
    if(regForm) {
        regForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const userField = document.getElementById('reg-username');
            const passField = document.getElementById('reg-password');
            const confirmField = document.getElementById('reg-confirm');
            const errorDiv = document.getElementById('reg-error');
            const successDiv = document.getElementById('reg-success');

            errorDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            const isEmailValid = EMAIL_REGEX.test(userField.value);
            const isPassValid = PASS_REGEX.test(passField.value);
            const isMatch = (passField.value === confirmField.value);

            if (!isEmailValid || !isPassValid || !isMatch) {
                errorDiv.textContent = "Please fix the errors in the form.";
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userField.value,
                        passwordHash: passField.value,
                        role: "CUSTOMER"
                    })
                });

                if (response.ok) {
                    successDiv.textContent = "Account created! Please Sign In.";
                    successDiv.classList.remove('hidden');
                    regForm.reset();
                    // Optional: Switch tab automatically
                    setTimeout(() => switchTab('login'), 1500);
                } else {
                    const data = await response.json();
                    errorDiv.textContent = data.error || "Registration failed.";
                    errorDiv.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                errorDiv.textContent = "Server connection error.";
                errorDiv.classList.remove('hidden');
            }
        });
    }

});