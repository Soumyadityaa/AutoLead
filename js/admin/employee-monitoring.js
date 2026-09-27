document.addEventListener('DOMContentLoaded', () => {

    // 1. Employee Code Filter Logic
    const empFilterSelect = document.getElementById('emp-code-filter');
    const tableBody = document.querySelector('#monitoring-table tbody');

    if (empFilterSelect && tableBody) {
        empFilterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                const rowEmpCode = row.getAttribute('data-emp-code');
                
                if (filterValue === 'ALL') {
                    row.style.display = ''; // Show all
                } else {
                    row.style.display = rowEmpCode === filterValue ? '' : 'none';
                }
            });
        });
    }

    // 2. Action Buttons Interaction (Send & Delete)
    const tableContainer = document.getElementById('monitoring-table');
    
    if (tableContainer) {
        // Using Event Delegation for action buttons dynamically
        tableContainer.addEventListener('click', (e) => {
            
            // Check if clicked element or its parent is the send button
            const sendBtn = e.target.closest('.btn-send');
            if (sendBtn) {
                const row = sendBtn.closest('tr');
                const leadName = row.querySelector('.lead-name').textContent;
                const empCode = row.querySelector('.emp-badge').textContent;
                
                // Visual feedback
                const originalHtml = sendBtn.innerHTML;
                sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Sent`;
                sendBtn.style.backgroundColor = 'var(--success-green)';
                sendBtn.style.color = '#ffffff';
                sendBtn.disabled = true;

                // Simple mock alert
                setTimeout(() => {
                    alert(`Lead "${leadName}" successfully forwarded to Management for ${empCode}.`);
                    // Reset button after alert
                    sendBtn.innerHTML = originalHtml;
                    sendBtn.style.backgroundColor = '';
                    sendBtn.style.color = '';
                    sendBtn.disabled = false;
                }, 400);
            }

            // Check if clicked element or its parent is the delete button
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                const leadName = row.querySelector('.lead-name').textContent;
                
                if (confirm(`Are you certain you want to permanently delete the lead record for "${leadName}"?`)) {
                    // Smooth fade out removal
                    row.style.transition = 'opacity 0.3s ease';
                    row.style.opacity = '0';
                    setTimeout(() => row.remove(), 300);
                }
            }
        });

        // 3. Status Dropdown State Management (Color Coding)
        const statusSelects = tableContainer.querySelectorAll('.status-select');
        
        statusSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const newValue = e.target.value;
                // Update the data-current attribute so CSS can apply the correct border and text color
                e.target.setAttribute('data-current', newValue);
            });
        });
    }
});