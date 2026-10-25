/**
 * Employee Email Campaigns Monitor Controller
 * Path: C:/xampp/htdocs/autolead/js/employee/campaigns.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const employeeUserBadge    = document.getElementById('employeeUserBadge');
  const campaignStatusFilter = document.getElementById('campaignStatusFilter');
  const campaignSearchInput  = document.getElementById('campaignSearchInput');
  const campaignsTableBody   = document.getElementById('campaignsTableBody');
  const campaignsCountBadge  = document.getElementById('campaignsCountBadge');

  let cachedCampaigns = [];
  let activeIntervals = [];

  function clearCounterIntervals() {
    activeIntervals.forEach((id) => clearInterval(id));
    activeIntervals = [];
  }

  function getCampaignStatusBadge(status) {
    if (status === 'Running') return 'badge badge-success';
    if (status === 'Scheduled') return 'badge badge-warning';
    return 'badge badge-info';
  }

  /**
   * Animate numeric percentage counter using setInterval
   */
  function animateCounter(element, targetValue) {
    const target = Math.max(0, Math.min(100, Number(targetValue) || 0));
    if (target === 0) {
      element.textContent = '0%';
      return;
    }

    let current = 0;
    const step  = Math.max(1, Math.ceil(target / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = `${current}%`;
    }, 28);

    activeIntervals.push(timer);
  }

  /**
   * Render campaigns table and trigger dual progress bar & setInterval animations
   */
  function renderCampaignsTable(campaigns) {
    clearCounterIntervals();
    campaignsCountBadge.textContent = `${campaigns.length} ${campaigns.length === 1 ? 'Campaign' : 'Campaigns'}`;

    if (campaigns.length === 0) {
      campaignsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No email campaigns match the selected filter.</td>
        </tr>`;
      return;
    }

    campaignsTableBody.innerHTML = campaigns
      .map((c) => {
        const badgeClass = getCampaignStatusBadge(c.status);
        const openRate   = Number(c.open_rate) || 0;
        const clickRate  = Number(c.click_rate) || 0;

        return `
          <tr>
            <td><strong>${AutoLead.escapeHtml(c.campaign_name)}</strong></td>
            <td><span class="${badgeClass}">${AutoLead.escapeHtml(c.status)}</span></td>
            <td>${AutoLead.escapeHtml(c.schedule_formatted)}</td>
            <td>${AutoLead.escapeHtml(c.last_activity_formatted)}</td>
            <td class="delivery-report-cell">
              <div class="dual-progress-group">
                <div class="progress-metric-row">
                  <div class="progress-label-line">
                    <span>Open Rate</span>
                    <span class="js-open-counter" data-target="${openRate}">0%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill fill-open js-open-bar" data-width="${openRate}"></div>
                  </div>
                </div>

                <div class="progress-metric-row">
                  <div class="progress-label-line">
                    <span>Click Rate</span>
                    <span class="js-click-counter" data-target="${clickRate}">0%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill fill-click js-click-bar" data-width="${clickRate}"></div>
                  </div>
                </div>
              </div>
            </td>
            <td><span class="recipients-pill">${Number(c.recipients_count).toLocaleString()}</span></td>
            <td><span class="badge badge-neutral">${AutoLead.escapeHtml(c.assigned_to)}</span></td>
          </tr>
        `;
      })
      .join('');

    // Trigger CSS width transitions and setInterval percentage counters after paint
    requestAnimationFrame(() => {
      document.querySelectorAll('.js-open-bar').forEach((bar) => {
        bar.style.width = `${bar.getAttribute('data-width')}%`;
      });
      document.querySelectorAll('.js-click-bar').forEach((bar) => {
        bar.style.width = `${bar.getAttribute('data-width')}%`;
      });
      document.querySelectorAll('.js-open-counter').forEach((el) => {
        animateCounter(el, el.getAttribute('data-target'));
      });
      document.querySelectorAll('.js-click-counter').forEach((el) => {
        animateCounter(el, el.getAttribute('data-target'));
      });
    });
  }

  function applySearchFilter() {
    const q = (campaignSearchInput.value || '').trim().toLowerCase();
    if (!q) {
      renderCampaignsTable(cachedCampaigns);
      return;
    }
    const filtered = cachedCampaigns.filter(
      (c) =>
        c.campaign_name.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        c.assigned_to.toLowerCase().includes(q)
    );
    renderCampaignsTable(filtered);
  }

  async function loadCampaigns(status = 'all') {
    try {
      const data = await AutoLead.apiFetch(
        `../api/employee_api.php?action=campaigns&status=${encodeURIComponent(status)}`
      );
      if (data.employee && employeeUserBadge) {
        employeeUserBadge.textContent = data.employee.employee_code;
      }
      cachedCampaigns = data.campaigns || [];
      applySearchFilter();
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load campaigns.', 'danger');
    }
  }

  campaignStatusFilter.addEventListener('change', () => {
    loadCampaigns(campaignStatusFilter.value);
  });

  campaignSearchInput.addEventListener('input', applySearchFilter);

  loadCampaigns('all');
});