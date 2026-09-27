document.addEventListener('DOMContentLoaded', () => {

    // Function to dynamically pull active theme colors
    const getChartColors = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: isDark ? '#adb5bd' : '#6c757d',
            grid: isDark ? '#333333' : '#e9ecef',
            tooltipBg: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(3, 4, 94, 0.95)',
            tooltipText: isDark ? '#121212' : '#ffffff'
        };
    };

    let convChartInstance, perfChartInstance;

    // 1. Initialize Line Chart (Conversion Graph: Oct to Jun)
    const convCtx = document.getElementById('conversionChart');
    if (convCtx) {
        const initLineChart = () => {
            const colors = getChartColors();
            
            convChartInstance = new Chart(convCtx, {
                type: 'line',
                data: {
                    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Conversions',
                        data: [120, 195, 150, 250, 220, 305, 280, 350, 410],
                        borderColor: '#00b4d8', // Primary Blue
                        backgroundColor: 'rgba(0, 180, 216, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#03045e', // Dark Purple
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
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
                            grid: { color: colors.grid, drawBorder: false },
                            ticks: { color: colors.text, padding: 10, stepSize: 100 }
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
        initLineChart();
    }

    // 2. Initialize Pie Chart (Performance Overview)
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        const initPieChart = () => {
            const colors = getChartColors();
            
            perfChartInstance = new Chart(perfCtx, {
                type: 'doughnut', // Doughnut looks more sophisticated than standard pie
                data: {
                    labels: ['Yes', 'No', 'Not sure'],
                    datasets: [{
                        data: [55, 25, 20],
                        backgroundColor: [
                            '#28a745', // Success Green
                            '#dc3545', // Danger Red
                            '#f39c12'  // Warning Orange
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%', // Creates the hollow center
                    plugins: {
                        legend: { display: false }, // Using custom HTML legend instead
                        tooltip: {
                            backgroundColor: colors.tooltipBg,
                            titleColor: colors.tooltipText,
                            bodyColor: colors.tooltipText,
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        };
        initPieChart();
    }

    // 3. Dynamic Chart Color Observer for Dark Mode Toggle
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                const newColors = getChartColors();
                
                // Update Line Chart Colors
                if (convChartInstance) {
                    convChartInstance.options.scales.y.grid.color = newColors.grid;
                    convChartInstance.options.scales.y.ticks.color = newColors.text;
                    convChartInstance.options.scales.x.ticks.color = newColors.text;
                    convChartInstance.options.plugins.tooltip.backgroundColor = newColors.tooltipBg;
                    convChartInstance.options.plugins.tooltip.titleColor = newColors.tooltipText;
                    convChartInstance.options.plugins.tooltip.bodyColor = newColors.tooltipText;
                    convChartInstance.update();
                }

                // Update Pie Chart Tooltip Colors
                if (perfChartInstance) {
                    perfChartInstance.options.plugins.tooltip.backgroundColor = newColors.tooltipBg;
                    perfChartInstance.options.plugins.tooltip.titleColor = newColors.tooltipText;
                    perfChartInstance.options.plugins.tooltip.bodyColor = newColors.tooltipText;
                    perfChartInstance.update();
                }
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true });
});