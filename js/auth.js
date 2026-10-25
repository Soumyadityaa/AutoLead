/**
 * AutoLead Centralized Authentication Controller
 * Path: C:/xampp/htdocs/autolead/js/auth.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm        = document.getElementById('loginForm');
  const roleInput        = document.getElementById('roleInput');
  const roleAdminBtn     = document.getElementById('roleAdminBtn');
  const roleEmployeeBtn  = document.getElementById('roleEmployeeBtn');
  const identifierLabel  = document.getElementById('identifierLabel');
  const identifierInput  = document.getElementById('identifierInput');
  const passwordInput    = document.getElementById('passwordInput');
  const togglePassBtn    = document.getElementById('togglePasswordBtn');
  const loginSubmitBtn   = document.getElementById('loginSubmitBtn');
  const authAlert        = document.getElementById('authAlert');
  const authAlertText    = document.getElementById('authAlertText');
  const demoChips        = document.querySelectorAll('[data-fill-role]');

  /**
   * Check if user already has a valid session and redirect automatically
   */
  async function checkExistingSession() {
    try {
      const res = await fetch('api/auth.php', { credentials: 'same-origin' });
      const data = await res.json();
      if (data.authenticated && data.user) {
        window.location.href = data.user.role === 'admin'
          ? 'admin/dashboard.html'
          : 'employee/dashboard.html';
      }
    } catch (err) {
      // Remain on login page if session check fails
    }
  }

  checkExistingSession();

  /**
   * Display scoped error or success banner inside login card
   */
  function showAuthAlert(message, isSuccess = false) {
    if (!authAlert || !authAlertText) return;
    authAlertText.textContent = message;
    authAlert.className = `auth-alert visible ${isSuccess ? 'alert-success' : 'alert-error'}`;
  }

  function hideAuthAlert() {
    if (!authAlert) return;
    authAlert.className = 'auth-alert';
  }

  /**
   * Switch active portal role (admin or employee)
   */
  function setRole(role) {
    hideAuthAlert();
    roleInput.value = role;

    if (role === 'admin') {
      roleAdminBtn.classList.add('active');
      roleAdminBtn.setAttribute('aria-selected', 'true');
      roleEmployeeBtn.classList.remove('active');
      roleEmployeeBtn.setAttribute('aria-selected', 'false');
      identifierLabel.textContent = 'Admin Code or Username';
      identifierInput.placeholder = 'e.g. ADMIN01 or admin';
    } else {
      roleEmployeeBtn.classList.add('active');
      roleEmployeeBtn.setAttribute('aria-selected', 'true');
      roleAdminBtn.classList.remove('active');
      roleAdminBtn.setAttribute('aria-selected', 'false');
      identifierLabel.textContent = 'Employee Code or Username';
      identifierInput.placeholder = 'e.g. EMP001 or arjun.mehta';
    }
  }

  roleAdminBtn.addEventListener('click', () => setRole('admin'));
  roleEmployeeBtn.addEventListener('click', () => setRole('employee'));

  /**
   * Toggle Password visibility with inline vector SVG icons
   */
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
             <line x1="1" y1="1" x2="23" y2="23"></line>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
           </svg>`;
    });
  }

  /**
   * Quick-Fill Seed Account Chips
   */
  demoChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const targetRole = chip.getAttribute('data-fill-role');
      const targetId   = chip.getAttribute('data-fill-id');
      setRole(targetRole);
      identifierInput.value = targetId;
      passwordInput.value   = 'password123';
      identifierInput.focus();
    });
  });

  /**
   * Async Login Form Submission
   */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthAlert();

    const identifier = identifierInput.value.trim();
    const password   = passwordInput.value;
    const role       = roleInput.value;

    if (!identifier || !password) {
      showAuthAlert('Please enter both your Username / Employee Code and Password.');
      return;
    }

    AutoLead.setButtonLoading(loginSubmitBtn, true, 'Processing...');

    try {
      const response = await fetch('api/auth.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          identifier,
          password,
          role
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showAuthAlert(result.message || 'Authentication failed. Please check your credentials.');
        AutoLead.setButtonLoading(loginSubmitBtn, false);
        return;
      }

      showAuthAlert(result.message || 'Authentication successful. Redirecting...', true);
      setTimeout(() => {
        window.location.href = result.redirect;
      }, 300);
    } catch (error) {
      showAuthAlert('Network error connecting to server. Ensure Apache and MySQL are running in XAMPP.');
      AutoLead.setButtonLoading(loginSubmitBtn, false);
    }
  });
});