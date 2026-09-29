document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#manage-task-table tbody');

    // 1. Task Status Dropdown Logic
    const statusSelects = document.querySelectorAll('.task-status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const newValue = e.target.value;
            const row = e.target.closest('tr');
            const taskSubject = row.querySelector('.task-subject').textContent;
            
            // Confirm completion
            if (newValue === 'Completed') {
                if (!confirm(`Are you sure you want to mark the task "${taskSubject}" as Completed?`)) {
                    // Revert selection if user cancels
                    e.target.value = e.target.getAttribute('data-current');
                    return;
                }
            }
            
            // Update the custom attribute to apply CSS coloring
            e.target.setAttribute('data-current', newValue);
            
            // If the task is completed, remove the red text warning from the due date
            if (newValue === 'Completed') {
                const dateCell = row.querySelector('td:nth-child(4) .date-text');
                if (dateCell && dateCell.classList.contains('text-danger')) {
                    dateCell.classList.remove('text-danger');
                }
                
                // Automatically toggle reminder badge to inactive
                const reminderBadge = row.querySelector('.reminder-badge');
                if (reminderBadge) {
                    reminderBadge.className = 'reminder-badge inactive';
                    reminderBadge.textContent = 'Off';
                }
            }
        });
    });

    // 2. Table Specific Filter/Search Logic
    const taskFilterInput = document.getElementById('task-table-filter');
    
    if (taskFilterInput && tableBody) {
        taskFilterInput.addEventListener('keyup', (e) => {
            const filterValue = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                // Get task ID and Subject text for searching
                const taskId = row.querySelector('.task-id')?.textContent.toLowerCase() || '';
                const taskSubject = row.querySelector('.task-subject')?.textContent.toLowerCase() || '';
                
                // Combine them for a broader search scope
                const searchableText = `${taskId} ${taskSubject}`;
                
                // Show/hide based on match
                if (searchableText.includes(filterValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});