document.addEventListener('DOMContentLoaded', () => {
    const dropBtn = document.getElementById('leads-dropbtn');
    const dropContent = document.getElementById('leads-dropdown-content');

    if (dropBtn && dropContent) {
        // Toggle dropdown on click
        dropBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up to the document click listener
            dropContent.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropBtn.contains(e.target) && !dropContent.contains(e.target)) {
                dropContent.classList.remove('show');
            }
        });
    }
});