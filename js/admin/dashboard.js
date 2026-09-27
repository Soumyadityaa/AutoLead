document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Chart.js
    const ctx = document.getElementById('leadGrowthChart');
    let leadChart;

    if (ctx) {
        const getChartColors = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                text: isDark ? '#adb5bd' : '#6c757d',
                grid: isDark ? '#333333' : '#e9ecef'
            };
        };

        const initChart = () => {
            const colors = getChartColors();
            
            leadChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'New Leads',
                        data: [12, 19, 15, 22, 28, 25, 30],
                        borderColor: '#00b4d8', 
                        backgroundColor: 'rgba(0, 180, 216, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#03045e', 
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
                        legend: {
                            display: false 
                        },
                        tooltip: {
                            backgroundColor: 'rgba(3, 4, 94, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false,
                            /* Bug Fix: Keep tooltip inside canvas bounds on mobile */
                            caretPadding: 10,
                            intersect: false,
                            mode: 'index',
                            position: 'nearest'
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true, 
                            max: 35,
                            grid: { color: colors.grid, drawBorder: false },
                            ticks: { color: colors.text, padding: 10 }
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

        // 2. Dynamic Chart Color Observer for Dark Mode Toggle
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    if (leadChart) {
                        const newColors = getChartColors();
                        leadChart.options.scales.y.grid.color = newColors.grid;
                        leadChart.options.scales.y.ticks.color = newColors.text;
                        leadChart.options.scales.x.ticks.color = newColors.text;
                        leadChart.update();
                    }
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
    }

    // 3. New Leads Table Filter Logic
    const filterSelect = document.getElementById('lead-filter');
    const leadsTableBody = document.querySelector('#new-leads-table tbody');

    if (filterSelect && leadsTableBody) {
        filterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            const rows = leadsTableBody.querySelectorAll('tr');

            rows.forEach(row => {
                const rowDate = row.getAttribute('data-date');
                if (filterValue === 'today') {
                    row.style.display = rowDate === 'today' ? '' : 'none';
                } else {
                    row.style.display = '';
                }
            });
        });
    }
});



// ========================================================
    // 4. Modal Popup Logic (New Leads View Profile)
    // ========================================================
    const modalOverlay = document.getElementById('profile-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const viewProfileBtns = document.querySelectorAll('.view-profile-btn');
    const modalLeadName = document.getElementById('modal-lead-name');
    const modalLeadEmail = document.getElementById('modal-lead-email');

    // Function to open and populate the modal
    const openModal = (name, email) => {
        if (!modalOverlay) return;
        
        // Inject dynamic data from the button's data attributes
        modalLeadName.textContent = name;
        modalLeadEmail.textContent = email;
        
        // Show the modal
        modalOverlay.classList.add('show');
        
        // Lock the body scroll on mobile/desktop so user doesn't accidentally scroll the page behind the modal
        document.body.style.overflow = 'hidden'; 
    };

    // Function to close the modal
    const closeModal = () => {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    };

    // Attach click listeners to all 'Eye' icon buttons in the New Leads table
    viewProfileBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const email = btn.getAttribute('data-email');
            openModal(name, email);
        });
    });

    // Close on clicking the 'X' button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Close on clicking the darkened overlay outside the modal box
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Close on pressing the 'Escape' key for desktop accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });