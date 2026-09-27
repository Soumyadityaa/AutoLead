document.addEventListener('DOMContentLoaded', () => {

    // 1. Progress Bar Animation Logic
    // Selects the percentage text elements and corresponding fills to animate them
    const progressFills = document.querySelectorAll('.progress-fill');
    const progressTexts = document.querySelectorAll('.progress-pct');

    // Trigger animations slightly after page load for visual effect
    setTimeout(() => {
        progressFills.forEach(fill => {
            const targetPercentage = fill.getAttribute('data-target');
            if (targetPercentage && parseInt(targetPercentage) > 0) {
                fill.style.width = targetPercentage + '%';
            }
        });

        // Animate the text counters from 0 to target
        progressTexts.forEach(textEl => {
            const target = parseInt(textEl.getAttribute('data-val'));
            if (!target || target === 0) return; // Skip N/A or 0 fields
            
            let current = 0;
            const increment = target / 30; // 30 steps for the animation
            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                textEl.textContent = Math.round(current) + '%';
            }, 35); // Update every 35ms
        });
    }, 200);

    // 2. Status Filter Logic
    const statusFilter = document.getElementById('campaign-status-filter');
    const tableBody = document.querySelector('#campaigns-table tbody');

    if (statusFilter && tableBody) {
        statusFilter.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            const rows = tableBody.querySelectorAll('tr');

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
    }

    // 3. Global Search Mock Logic
    const globalSearchInput = document.getElementById('global-search');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    alert(`Searching Employee Database for Campaigns matching: "${query}"`);
                }
            }
        });
    }
});