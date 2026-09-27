// Execute as early as possible to prevent Theme FOUC (Flash of Unstyled Content)
(function initTheme() {
    const savedTheme = localStorage.getItem('autolead-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Theme Toggle Functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('autolead-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('autolead-theme', 'dark');
            }
        });
    }

    // 2. Mobile navigation toggle functionality
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const isExpanded = navLinks.classList.contains('show');
            menuBtn.setAttribute('aria-expanded', isExpanded);
        });
    }

    // 3. Global Dropdown Management (closes dropdowns if clicked outside)
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.dropbtn')) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                if (dropdown.style.display === 'block') {
                    dropdown.style.display = 'none';
                }
            });
        }
    });

    // Handle Dropbtn clicks for mobile compatibility
    const dropBtns = document.querySelectorAll('.dropbtn');
    dropBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.nextElementSibling;
            if (content && content.classList.contains('dropdown-content')) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
});