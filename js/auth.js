document.addEventListener('DOMContentLoaded', () => {
    const tabAdmin = document.getElementById('tab-admin');
    const tabEmployee = document.getElementById('tab-employee');
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit-btn');
    
    // Default role state
    let currentRole = 'admin';

    // Handle Tab Switching
    tabAdmin.addEventListener('click', () => {
        currentRole = 'admin';
        tabAdmin.classList.add('active');
        tabEmployee.classList.remove('active');
        
        // Update Button Text
        submitBtn.textContent = 'LOG IN AS ADMIN';
        submitBtn.style.backgroundColor = 'var(--primary-blue)';
    });

    tabEmployee.addEventListener('click', () => {
        currentRole = 'employee';
        tabEmployee.classList.add('active');
        tabAdmin.classList.remove('active');
        
        // Update Button Text to visually distinguish employee login
        submitBtn.textContent = 'LOG IN AS EMPLOYEE';
        // Use the accent color defined in style.css for employee context
        submitBtn.style.backgroundColor = 'var(--success-green)'; 
    });

    // Handle Form Submission Routing
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Visual feedback during "authentication"
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'AUTHENTICATING...';
        submitBtn.style.opacity = '0.8';

        // Simulate network request delay (500ms)
        setTimeout(() => {
            if (currentRole === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'employee/dashboard.html';
            }
        }, 500);
    });
});