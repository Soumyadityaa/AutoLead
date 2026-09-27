document.addEventListener('DOMContentLoaded', () => {

    const tableBody = document.querySelector('#tasks-table tbody');

    // 1. Task Status Dropdown State Management
    const tableContainer = document.getElementById('tasks-table');
    
    if (tableContainer) {
        const statusSelects = tableContainer.querySelectorAll('.status-select');
        
        statusSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const newValue = e.target.value;
                const row = e.target.closest('tr');
                const taskName = row.querySelector('.task-name').textContent;
                
                // Add a confirmation for completing tasks
                if (newValue === 'complete') {
                    if (!confirm(`Are you sure you want to mark "${taskName}" as Complete?`)) {
                        // Revert selection if user cancels
                        e.target.value = e.target.getAttribute('data-current');
                        return;
                    }
                }
                
                // Update the data-current attribute so CSS applies the new color coding
                e.target.setAttribute('data-current', newValue);
                // Also update the row's status attribute so the filter can still find it
                row.setAttribute('data-status', newValue);
                
                // If marked as complete, update the date text to a standard color if it was overdue
                if (newValue === 'complete' || newValue === 'pending') {
                    const dateText = row.querySelector('.date-text');
                    if (dateText.classList.contains('text-danger')) {
                        dateText.classList.remove('text-danger');
                    }
                }
            });
        });
    }

    // 2. Filter Logic (All / Pending / Complete / Overdue)
    const taskFilterSelect = document.getElementById('task-filter');

    if (taskFilterSelect && tableBody) {
        taskFilterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            const rows = tableBody.querySelectorAll('tr');

            // Apply a smooth transition effect during filtering
            rows.forEach(row => {
                const rowStatus = row.getAttribute('data-status');
                
                if (filterValue === 'ALL') {
                    row.style.display = ''; 
                    setTimeout(() => row.style.opacity = '1', 10);
                } else {
                    if (rowStatus === filterValue) {
                        row.style.display = '';
                        setTimeout(() => row.style.opacity = '1', 10);
                    } else {
                        row.style.opacity = '0';
                        // Wait for fade out before hiding completely
                        setTimeout(() => row.style.display = 'none', 300);
                    }
                }
            });
        });
        
        // Check URL parameters for direct linking (e.g. from Dashboard "Over due task" nav link)
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        
        if (filterParam) {
            // Check if the filter param is a valid option
            const validOptions = ['ALL', 'pending', 'complete', 'overdue'];
            if (validOptions.includes(filterParam)) {
                taskFilterSelect.value = filterParam;
                // Dispatch change event to trigger the filter logic above
                taskFilterSelect.dispatchEvent(new Event('change'));
            }
        }
    }
});