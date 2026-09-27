document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize "My Lead Growth" Chart.js
    const ctx = document.getElementById('myLeadGrowthChart');
    let leadGrowthChart;

    if (ctx) {
        // Function to determine text/grid color based on active theme
        const getChartColors = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                text: isDark ? '#adb5bd' : '#6c757d',
                grid: isDark ? '#333333' : '#e9ecef',
                tooltipBg: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(3, 4, 94, 0.95)',
                tooltipText: isDark ? '#121212' : '#ffffff'
            };
        };

        const initChart = () => {
            const colors = getChartColors();
            
            leadGrowthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'My Leads',
                        data: [10, 15, 25, 20],
                        borderColor: '#00b4d8', // Primary Blue
                        backgroundColor: 'rgba(0, 180, 216, 0.15)',
                        borderWidth: 3,
                        pointBackgroundColor: '#03045e', // Dark Purple
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.3 // Smooth curves
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: colors.tooltipBg,
                            titleColor: colors.tooltipText,
                            bodyColor: colors.tooltipText,
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false,
                            caretPadding: 10,
                            intersect: false,
                            mode: 'index'
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true, 
                            max: 35,
                            grid: { color: colors.grid, drawBorder: false },
                            ticks: { color: colors.text, padding: 10, stepSize: 10 }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: colors.text, padding: 10 }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    }
                }
            });
        };

        initChart();

        // Observer to dynamically update Chart colors on Dark/Light mode toggle
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    if (leadGrowthChart) {
                        const newColors = getChartColors();
                        leadGrowthChart.options.scales.y.grid.color = newColors.grid;
                        leadGrowthChart.options.scales.y.ticks.color = newColors.text;
                        leadGrowthChart.options.scales.x.ticks.color = newColors.text;
                        leadGrowthChart.options.plugins.tooltip.backgroundColor = newColors.tooltipBg;
                        leadGrowthChart.options.plugins.tooltip.titleColor = newColors.tooltipText;
                        leadGrowthChart.options.plugins.tooltip.bodyColor = newColors.tooltipText;
                        leadGrowthChart.update();
                    }
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
    }

    // 2. Complete Task Button Interaction
    const completeTaskBtn = document.getElementById('complete-task-btn');
    if (completeTaskBtn) {
        completeTaskBtn.addEventListener('click', () => {
            const originalHtml = completeTaskBtn.innerHTML;
            
            // Visual Loading State
            completeTaskBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                PROCESSING...
            `;
            completeTaskBtn.style.opacity = '0.8';
            completeTaskBtn.disabled = true;

            // Ensure keyframes for spin are in document
            if (!document.getElementById('spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spin-keyframes';
                style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            // Simulate network request
            setTimeout(() => {
                alert('Success: Top priority task marked as complete. Lead data fully exhausted.');
                
                // Revert button visually
                completeTaskBtn.innerHTML = originalHtml;
                completeTaskBtn.style.opacity = '1';
                completeTaskBtn.disabled = false;
            }, 600);
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
                    alert(`Searching database for: "${query}"`);
                    // In a real application, this would route to a search results page
                }
            }
        });
    }
});