document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#manage-activity-table tbody');

    // 1. Activity Status Dropdown State Management (Color Coding)
    const statusSelects = document.querySelectorAll('.activity-status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const newValue = e.target.value;
            const row = e.target.closest('tr');
            const leadName = row.querySelector('.lead-name').textContent;
            
            // Confirm irreversible actions
            if (newValue === 'Cancelled' || newValue === 'Completed') {
                if (!confirm(`Are you sure you want to mark the activity for "${leadName}" as ${newValue}?`)) {
                    // Revert selection if user cancels
                    e.target.value = e.target.getAttribute('data-current');
                    return;
                }
            }
            
            // Update the custom attribute to apply CSS coloring
            e.target.setAttribute('data-current', newValue);
            
            // If the activity is completed or cancelled, visually update the 'Activity Date' to 'Just now'
            if (newValue === 'Completed' || newValue === 'Cancelled') {
                const dateCell = row.querySelector('td:nth-child(3) .date-text');
                if (dateCell) {
                    dateCell.textContent = 'Just now';
                    dateCell.className = 'date-text highlight'; // Resets any text-muted or text-danger classes
                }
            }
        });
    });

    // 2. Table Specific Filter/Search Logic
    const activityFilterInput = document.getElementById('activity-table-filter');
    
    if (activityFilterInput && tableBody) {
        activityFilterInput.addEventListener('keyup', (e) => {
            const filterValue = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                // Get the lead name text content from the first column
                const leadNameElement = row.querySelector('.lead-name');
                if (leadNameElement) {
                    const leadName = leadNameElement.textContent.toLowerCase();
                    
                    // Simple show/hide logic based on text match
                    if (leadName.includes(filterValue)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }
});