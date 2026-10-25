/**
 * Employee Navigation "Leads" Dropdown & Mobile Drawer Controller
 * Path: D:/xampp/htdocs/Autolead/js/employee/nav-dropdown.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const leadsNavDropdown     = document.getElementById('leadsNavDropdown');
  const leadsDropdownTrigger = document.getElementById('leadsDropdownTrigger');
  const navbarMenu           = document.getElementById('navbarMenu');
  const mobileMenuBtn        = document.getElementById('mobileMenuBtn');

  if (!leadsNavDropdown || !leadsDropdownTrigger) return;

  // Toggle "Leads" submenu on click/tap
  leadsDropdownTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = leadsNavDropdown.classList.toggle('open');
    leadsDropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close dropdown & mobile drawer when clicking outside the navbar
  document.addEventListener('click', (e) => {
    if (!leadsNavDropdown.contains(e.target)) {
      leadsNavDropdown.classList.remove('open');
      leadsDropdownTrigger.setAttribute('aria-expanded', 'false');
    }

    if (
      navbarMenu &&
      navbarMenu.classList.contains('mobile-open') &&
      !navbarMenu.contains(e.target) &&
      (!mobileMenuBtn || !mobileMenuBtn.contains(e.target))
    ) {
      navbarMenu.classList.remove('mobile-open');
    }
  });

  // Close mobile drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      leadsNavDropdown.classList.remove('open');
      leadsDropdownTrigger.setAttribute('aria-expanded', 'false');
      if (navbarMenu) {
        navbarMenu.classList.remove('mobile-open');
      }
    }
  });
});