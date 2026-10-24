/**
 * AutoLead Global Theme, Modal, Micro-Interaction & Navigation Engine
 * Path: C:/xampp/htdocs/autolead/js/main.js
 */

(function initThemeBeforePaint() {
  try {
    const savedTheme = localStorage.getItem('autolead-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch (err) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

const AutoLead = (() => {
  const THEME_KEY = 'autolead-theme';
  const themeSubscribers = new Set();

  /**
   * Return SVG markup for sun (light mode) or moon (dark mode) icon
   */
  function getThemeIconMarkup(theme) {
    if (theme === 'dark') {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }

  /**
   * Synchronize all theme toggle buttons with current data-theme
   */
  function syncThemeButtons() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const buttons = document.querySelectorAll('[data-theme-toggle], #themeToggleBtn');
    buttons.forEach((btn) => {
      btn.innerHTML = getThemeIconMarkup(currentTheme);
      btn.setAttribute(
        'title',
        currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
      );
    });
  }

  /**
   * Toggle between light and dark theme and persist to localStorage
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      // Ignore storage quota errors
    }
    syncThemeButtons();
  }

  /**
   * Get computed CSS variables for Chart.js dynamic repainting
   */
  function getChartThemeTokens() {
    const styles = getComputedStyle(document.documentElement);
    return {
      gridColor: styles.getPropertyValue('--chart-grid').trim() || 'rgba(148, 163, 184, 0.2)',
      textColor: styles.getPropertyValue('--chart-text').trim() || '#64748b',
      tooltipBg: styles.getPropertyValue('--chart-tooltip-bg').trim() || '#0f172a',
      tooltipText: styles.getPropertyValue('--chart-tooltip-text').trim() || '#ffffff',
      primary: styles.getPropertyValue('--brand-primary').trim() || '#1da9e8',
      secondary: styles.getPropertyValue('--brand-secondary').trim() || '#687bd2',
      success: styles.getPropertyValue('--color-success').trim() || '#10b981',
      warning: styles.getPropertyValue('--color-warning').trim() || '#f59e0b',
      danger: styles.getPropertyValue('--color-danger').trim() || '#ef4444'
    };
  }

  /**
   * Register a callback or Chart.js instance to repaint when data-theme mutates
   */
  function onThemeChange(callback) {
    if (typeof callback === 'function') {
      themeSubscribers.add(callback);
    }
  }

  /**
   * Inject inline SVG spinning loader, dim opacity, disable pointer events, and show "Processing..."
   */
  function setButtonLoading(buttonEl, isLoading, loadingText = 'Processing...') {
    if (!buttonEl) return;

    if (isLoading) {
      if (!buttonEl.dataset.originalHtml) {
        buttonEl.dataset.originalHtml = buttonEl.innerHTML;
      }
      buttonEl.classList.add('is-loading');
      buttonEl.disabled = true;
      buttonEl.innerHTML = `
        <svg class="spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        <span>${loadingText}</span>
      `;
    } else {
      buttonEl.classList.remove('is-loading');
      buttonEl.disabled = false;
      if (buttonEl.dataset.originalHtml) {
        buttonEl.innerHTML = buttonEl.dataset.originalHtml;
      }
    }
  }

  /**
   * Open a scroll-locked modal overlay by ID
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  /**
   * Close a scroll-locked modal overlay by ID
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    const anyActive = document.querySelector('.modal-overlay.active');
    if (!anyActive) {
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Render a non-blocking toast notification with inline SVG icon
   */
  function showToast(message, type = 'info') {
    let container = document.getElementById('autoleadToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'autoleadToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`;

    if (type === 'success') {
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
    } else if (type === 'danger') {
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Return semantic badge class for Lead Score (0-100)
   */
  function getScoreBadgeClass(score) {
    const num = Number(score) || 0;
    if (num >= 75) return 'badge score-high';
    if (num >= 50) return 'badge score-medium';
    return 'badge score-low';
  }

  /**
   * Return semantic badge class for Lead Stage
   */
  function getStageBadgeClass(stage) {
    switch (stage) {
      case 'Closed Won':
        return 'badge badge-success';
      case 'Closed Lost':
        return 'badge badge-danger';
      case 'Negotiation':
        return 'badge badge-warning';
      case 'Prospect':
        return 'badge badge-purple';
      default:
        return 'badge badge-info';
    }
  }

  /**
   * Standardized JSON fetch wrapper with 401/403 redirect handling
   */
  async function apiFetch(url, options = {}) {
    const fetchOptions = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (response.status === 401) {
      window.location.href = '../index.html';
      throw new Error(data.message || 'Session expired.');
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  }

  /**
   * Execute global logout
   */
  async function handleLogout(buttonEl) {
    if (buttonEl) {
      setButtonLoading(buttonEl, true, 'Signing out...');
    }
    try {
      const isRoot = !window.location.pathname.includes('/admin/') && !window.location.pathname.includes('/employee/');
      const apiPath = isRoot ? 'api/auth.php?action=logout' : '../api/auth.php?action=logout';
      await fetch(apiPath, { credentials: 'same-origin' });
      window.location.href = isRoot ? 'index.html' : '../index.html';
    } catch (err) {
      window.location.href = '../index.html';
    }
  }

  // Initialize DOM listeners & MutationObserver
  document.addEventListener('DOMContentLoaded', () => {
    syncThemeButtons();

    // MutationObserver watching document.documentElement for data-theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const tokens = getChartThemeTokens();
          themeSubscribers.forEach((cb) => cb(tokens));
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Delegate theme toggle clicks, modal closes, mobile hamburger, and logout clicks
    document.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-theme-toggle], #themeToggleBtn');
      if (themeBtn) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      const mobileBtn = e.target.closest('#mobileMenuBtn, [data-mobile-menu-toggle]');
      if (mobileBtn) {
        e.preventDefault();
        const menu = document.getElementById('navbarMenu');
        if (menu) {
          menu.classList.toggle('mobile-open');
        }
        return;
      }

      const modalCloseBtn = e.target.closest('[data-close-modal]');
      if (modalCloseBtn) {
        e.preventDefault();
        const targetId = modalCloseBtn.getAttribute('data-close-modal');
        closeModal(targetId);
        return;
      }

      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) {
          document.body.classList.remove('modal-open');
        }
        return;
      }

      const logoutBtn = e.target.closest('#logoutBtn, .js-logout');
      if (logoutBtn) {
        e.preventDefault();
        handleLogout(logoutBtn);
      }
    });

    // Escape key closes active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal && activeModal.id) {
          closeModal(activeModal.id);
        }
      }
    });
  });

  return {
    toggleTheme,
    getChartThemeTokens,
    onThemeChange,
    setButtonLoading,
    openModal,
    closeModal,
    showToast,
    escapeHtml,
    getScoreBadgeClass,
    getStageBadgeClass,
    apiFetch,
    handleLogout
  };
})();

window.AutoLead = AutoLead;