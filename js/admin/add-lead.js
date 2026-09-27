document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('add-lead-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form) {
        // Real-time validation clearing on input
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    input.classList.remove('is-invalid');
                }
            });
        });

        // Form Submission Logic
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            
            // 1. Basic Validation Logic
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            // If form is invalid, shake the button slightly or just halt
            if (!isValid) {
                alert('Please fill out all required fields marked with an asterisk (*).');
                return;
            }

            // 2. Mock API Submission State
            const originalBtnHtml = submitBtn.innerHTML;
            
            // UI Feedback
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-anim"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                Processing...
            `;

            // Simple CSS animation injection for the spinner
            const style = document.createElement('style');
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin-anim { animation: spin 1.2s linear infinite; }`;
            document.head.appendChild(style);

            // Simulate network delay (800ms)
            setTimeout(() => {
                // Success State
                submitBtn.classList.remove('loading');
                submitBtn.style.backgroundColor = 'var(--success-green)';
                submitBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Lead Saved Successfully!
                `;

                // Reset form fields
                form.reset();

                // Revert button visually after 2.5 seconds
                setTimeout(() => {
                    submitBtn.style.backgroundColor = '';
                    submitBtn.innerHTML = originalBtnHtml;
                    style.remove(); // Clean up spin styles
                }, 2500);

            }, 800);
        });
    }
});