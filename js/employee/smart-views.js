document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Custom Tab Switching Logic
    const tabBtns = document.querySelectorAll('.smart-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Ignore if clicking already active tab
                if (btn.classList.contains('active')) return;

                // Remove active classes from all buttons and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked button
                btn.classList.add('active');

                // Find target content ID and activate it
                const targetId = btn.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Optional: Scroll the tab container to center the clicked button on mobile
                const tabWrapper = document.querySelector('.smart-tabs-wrapper');
                if (tabWrapper && window.innerWidth <= 768) {
                    const scrollLeft = btn.offsetLeft - (tabWrapper.offsetWidth / 2) + (btn.offsetWidth / 2);
                    tabWrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
            });
        });
    }

    // 2. Play Record Mock Interaction
    const playBtns = document.querySelectorAll('.play-record-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalHtml = btn.innerHTML;
            
            // Visual feedback of playing
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Playing...`;
            btn.style.backgroundColor = 'var(--primary-blue)';
            btn.style.color = '#ffffff';
            
            // Revert after 3 seconds for mock demonstration
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 3000);
        });
    });

    // 3. Global Search Mock Logic
    const globalSearchInput = document.getElementById('global-search');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    alert(`Searching Smart Views data for: "${query}"`);
                }
            }
        });
    }
});