document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#manage-lead-table tbody');

    // 1. Stage Dropdown State Management (Color Coding)
    const stageSelects = document.querySelectorAll('.stage-select');
    
    stageSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const newValue = e.target.value;
            const row = e.target.closest('tr');
            const leadName = row.querySelector('.lead-name').textContent;
            
            // Confirm irreversible actions like Closing
            if (newValue === 'Closed Won' || newValue === 'Closed Lost') {
                if (!confirm(`Are you sure you want to mark "${leadName}" as ${newValue}?`)) {
                    // Revert selection if user cancels
                    e.target.value = e.target.getAttribute('data-current');
                    return;
                }
            }
            
            // Update the custom attribute to apply CSS coloring
            e.target.setAttribute('data-current', newValue);
            
            // Visually update the 'Modified On' date to 'Just now'
            const modifiedCell = row.querySelector('td:nth-child(5) .date-text');
            if (modifiedCell) {
                modifiedCell.textContent = 'Just now';
                modifiedCell.style.color = 'var(--primary-blue)';
                modifiedCell.style.fontWeight = 'bold';
            }
        });
    });

    // 2. Table Specific Filter/Search Logic
    const leadFilterInput = document.getElementById('lead-table-filter');
    
    if (leadFilterInput && tableBody) {
        leadFilterInput.addEventListener('keyup', (e) => {
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