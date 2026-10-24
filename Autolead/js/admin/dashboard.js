/**
 * Admin Dashboard & Credential Provisioning Controller
 * Path: D:/xampp/htdocs/Autolead/js/admin/dashboard.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const metricTotalLeads   = document.getElementById('metricTotalLeads');
  const metricNewLeads     = document.getElementById('metricNewLeads');
  const metricWonLeads     = document.getElementById('metricWonLeads');
  const metricOverdueTasks = document.getElementById('metricOverdueTasks');
  const leadsFunnelBody    = document.getElementById('leadsFunnelBody');
  const newLeadsTableBody  = document.getElementById('newLeadsTableBody');
  const newLeadsFilter     = document.getElementById('newLeadsFilter');
  const empNavDropdown     = document.getElementById('empNavDropdown');
  const empNavTrigger      = document.getElementById('empNavTrigger');
  const empNavMenu         = document.getElementById('empNavMenu');

  // Credential Provisioning Modal Elements
  const openCreateUserModalBtn   = document.getElementById('openCreateUserModalBtn');
  const createUserForm           = document.getElementById('createUserForm');
  const newAccountRole           = document.getElementById('newAccountRole');
  const newAccountCode           = document.getElementById('newAccountCode');
  const newAccountCodeLabel      = document.getElementById('newAccountCodeLabel');
  const newAccountFullName       = document.getElementById('newAccountFullName');
  const newAccountUsername       = document.getElementById('newAccountUsername');
  const newAccountPassword       = document.getElementById('newAccountPassword');
  const toggleNewUserPassBtn     = document.getElementById('toggleNewUserPassBtn');
  const createUserSubmitBtn      = document.getElementById('createUserSubmitBtn');
  const createUserAlert          = document.getElementById('createUserAlert');
  const registeredUsersTableBody = document.getElementById('registeredUsersTableBody');

  let growthChartInstance = null;

  // Top navbar Employee Code dropdown toggle
  if (empNavTrigger && empNavDropdown) {
    empNavTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      empNavDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!empNavDropdown.contains(e.target)) {
        empNavDropdown.classList.remove('open');
      }
    });
  }

  /**
   * Dynamically populate top navbar Employee Code menu so new employees (EMP004+) appear immediately
   */
  function renderDynamicEmployeeNav(employees) {
    if (!empNavMenu || !Array.isArray(employees)) return;
    const itemsHtml = employees
      .map(
        (emp) =>
          `<a href="employee-monitoring.html?employee_code=${encodeURIComponent(emp.employee_code)}" class="nav-dropdown-item">
             ${AutoLead.escapeHtml(emp.employee_code)} - ${AutoLead.escapeHtml(emp.full_name)}
           </a>`
      )
      .join('');

    empNavMenu.innerHTML = `<a href="employee-monitoring.html?employee_code=ALL" class="nav-dropdown-item">All Employees</a>${itemsHtml}`;
  }

  /**
   * Render Registered System Accounts Directory inside the Provisioning Modal
   */
  function renderRegisteredUsersTable(usersList) {
    if (!registeredUsersTableBody || !Array.isArray(usersList)) return;
    if (usersList.length === 0) {
      registeredUsersTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No registered accounts found.</td></tr>`;
      return;
    }

    registeredUsersTableBody.innerHTML = usersList
      .map((u) => {
        const roleBadge =
          u.role === 'admin'
            ? '<span class="badge badge-purple">Admin</span>'
            : '<span class="badge badge-info">Employee</span>';

        return `
          <tr>
            <td><strong>${AutoLead.escapeHtml(u.employee_code)}</strong></td>
            <td>${AutoLead.escapeHtml(u.full_name)}</td>
            <td><code>${AutoLead.escapeHtml(u.username)}</code></td>
            <td>${roleBadge}</td>
            <td>${AutoLead.escapeHtml(u.created_formatted)}</td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Initialize or update 7-Day Rolling Lead Growth Chart.js instance
   */
  function renderLeadGrowthChart(labels, values) {
    const canvas = document.getElementById('leadGrowthChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const tokens = AutoLead.getChartThemeTokens();

    if (growthChartInstance) {
      growthChartInstance.data.labels = labels;
      growthChartInstance.data.datasets[0].data = values;
      growthChartInstance.update();
      return;
    }

    growthChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'New Leads Ingested',
            data: values,
            borderColor: tokens.primary,
            backgroundColor: 'rgba(29, 169, 232, 0.16)',
            borderWidth: 3,
            pointBackgroundColor: tokens.primary,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: tokens.textColor, font: { weight: '600' } }
          },
          tooltip: {
            backgroundColor: tokens.tooltipBg,
            titleColor: tokens.tooltipText,
            bodyColor: tokens.tooltipText
          }
        },
        scales: {
          x: {
            grid: { color: tokens.gridColor },
            ticks: { color: tokens.textColor }
          },
          y: {
            beginAtZero: true,
            grid: { color: tokens.gridColor },
            ticks: { color: tokens.textColor, precision: 0 }
          }
        }
      }
    });
  }

  AutoLead.onThemeChange((tokens) => {
    if (!growthChartInstance) return;
    growthChartInstance.options.plugins.legend.labels.color = tokens.textColor;
    growthChartInstance.options.plugins.tooltip.backgroundColor = tokens.tooltipBg;
    growthChartInstance.options.scales.x.grid.color = tokens.gridColor;
    growthChartInstance.options.scales.x.ticks.color = tokens.textColor;
    growthChartInstance.options.scales.y.grid.color = tokens.gridColor;
    growthChartInstance.options.scales.y.ticks.color = tokens.textColor;
    growthChartInstance.update();
  });

  function renderLeadsFunnel(funnelRows) {
    if (!funnelRows || funnelRows.length === 0) {
      leadsFunnelBody.innerHTML = `<tr><td colspan="4" class="empty-state">No leads in funnel.</td></tr>`;
      return;
    }

    leadsFunnelBody.innerHTML = funnelRows
      .map((row) => {
        const stageClass = AutoLead.getStageBadgeClass(row.lead_stage);
        return `
          <tr>
            <td>
              <a href="lead-preview.html?lead_id=${Number(row.id)}" class="lead-link">
                ${AutoLead.escapeHtml(row.lead_name)}
              </a>
            </td>
            <td>${AutoLead.escapeHtml(row.source)}</td>
            <td>
              <span class="badge badge-neutral">${AutoLead.escapeHtml(row.assigned_to)}</span>
            </td>
            <td><span class="${stageClass}">${AutoLead.escapeHtml(row.lead_stage)}</span></td>
          </tr>
        `;
      })
      .join('');
  }

  function renderNewLeadsTriage(leads) {
    if (!leads || leads.length === 0) {
      newLeadsTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No leads match the selected timeframe filter.</td></tr>`;
      return;
    }

    newLeadsTableBody.innerHTML = leads
      .map((lead) => {
        const scoreClass = AutoLead.getScoreBadgeClass(lead.lead_score);
        const stageClass = AutoLead.getStageBadgeClass(lead.lead_stage);
        return `
          <tr>
            <td><strong>${AutoLead.escapeHtml(lead.lead_name)}</strong></td>
            <td>${AutoLead.escapeHtml(lead.source)}</td>
            <td>
              <a href="employee-monitoring.html?employee_code=${encodeURIComponent(lead.assigned_to)}" class="badge badge-neutral">
                ${AutoLead.escapeHtml(lead.assigned_to)} - ${AutoLead.escapeHtml(lead.assigned_name || '')}
              </a>
            </td>
            <td><span class="${scoreClass}">${Number(lead.lead_score)}</span></td>
            <td><span class="${stageClass}">${AutoLead.escapeHtml(lead.lead_stage)}</span></td>
            <td>${AutoLead.escapeHtml(lead.created_formatted)}</td>
            <td>
              <button
                type="button"
                class="btn btn-secondary btn-sm js-view-profile"
                data-id="${Number(lead.id)}"
                data-name="${AutoLead.escapeHtml(lead.lead_name)}"
                data-age="${Number(lead.age)}"
                data-gender="${AutoLead.escapeHtml(lead.gender)}"
                data-email="${AutoLead.escapeHtml(lead.email)}"
                data-phone="${AutoLead.escapeHtml(lead.phone)}"
                data-source="${AutoLead.escapeHtml(lead.source)}"
                data-assigned="${AutoLead.escapeHtml(lead.assigned_to)} (${AutoLead.escapeHtml(lead.assigned_name || '')})"
                data-score="${Number(lead.lead_score)}"
                data-stage="${AutoLead.escapeHtml(lead.lead_stage)}"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>View Profile</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  async function loadDashboardData(filterValue = 'week') {
    try {
      const data = await AutoLead.apiFetch(
        `../api/admin_api.php?action=dashboard&filter=${encodeURIComponent(filterValue)}`
      );

      if (data.admin) {
        const badge = document.getElementById('adminUserBadge');
        if (badge) badge.textContent = data.admin.employee_code;
      }

      if (data.employees) {
        renderDynamicEmployeeNav(data.employees);
      }

      if (data.users_list) {
        renderRegisteredUsersTable(data.users_list);
      }

      if (data.summary) {
        metricTotalLeads.textContent   = data.summary.total_leads;
        metricNewLeads.textContent     = data.summary.new_leads_count;
        metricWonLeads.textContent     = data.summary.won_count;
        metricOverdueTasks.textContent = data.summary.overdue_tasks_count;
      }

      if (data.growth_chart) {
        renderLeadGrowthChart(data.growth_chart.labels, data.growth_chart.values);
      }

      renderLeadsFunnel(data.leads_funnel);
      renderNewLeadsTriage(data.new_leads);
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load dashboard data.', 'danger');
    }
  }

  if (newLeadsFilter) {
    newLeadsFilter.addEventListener('change', () => {
      loadDashboardData(newLeadsFilter.value);
    });
  }

  // Event delegation for View Profile modal trigger
  newLeadsTableBody.addEventListener('click', (e) => {
    const profileBtn = e.target.closest('.js-view-profile');
    if (!profileBtn) return;

    const leadId   = profileBtn.getAttribute('data-id');
    const name     = profileBtn.getAttribute('data-name');
    const age      = profileBtn.getAttribute('data-age');
    const gender   = profileBtn.getAttribute('data-gender');
    const email    = profileBtn.getAttribute('data-email');
    const phone    = profileBtn.getAttribute('data-phone');
    const source   = profileBtn.getAttribute('data-source');
    const assigned = profileBtn.getAttribute('data-assigned');
    const score    = profileBtn.getAttribute('data-score');
    const stage    = profileBtn.getAttribute('data-stage');

    document.getElementById('modalLeadName').textContent          = name;
    document.getElementById('modalFieldFullName').textContent     = name;
    document.getElementById('modalFieldDemographics').textContent = `${age} yrs / ${gender}`;
    document.getElementById('modalFieldEmail').textContent        = email;
    document.getElementById('modalFieldPhone').textContent        = phone;
    document.getElementById('modalFieldSource').textContent       = source;
    document.getElementById('modalFieldAssigned').textContent     = assigned;

    const scoreBadge = document.getElementById('modalFieldScoreBadge');
    scoreBadge.textContent = `${score} / 100`;
    scoreBadge.className   = AutoLead.getScoreBadgeClass(score);

    const stageBadge = document.getElementById('modalFieldStageBadge');
    stageBadge.textContent = stage;
    stageBadge.className   = AutoLead.getStageBadgeClass(stage);

    const auditLink = document.getElementById('modalFullAuditLink');
    auditLink.href = `lead-preview.html?lead_id=${encodeURIComponent(leadId)}`;

    AutoLead.openModal('profileViewModal');
  });

  // ==========================================================================
  // Credential Provisioning Modal Logic
  // ==========================================================================
  function showCredentialAlert(msg, isSuccess = false) {
    if (!createUserAlert) return;
    createUserAlert.textContent = msg;
    createUserAlert.className = `credential-alert visible ${isSuccess ? 'alert-success' : 'alert-danger'}`;
  }

  function clearCredentialAlert() {
    if (!createUserAlert) return;
    createUserAlert.className = 'credential-alert';
    createUserAlert.textContent = '';
  }

  if (openCreateUserModalBtn) {
    openCreateUserModalBtn.addEventListener('click', () => {
      clearCredentialAlert();
      AutoLead.openModal('createUserModal');
    });
  }

  if (newAccountRole) {
    newAccountRole.addEventListener('change', () => {
      if (newAccountRole.value === 'admin') {
        newAccountCodeLabel.textContent = 'Admin Code *';
        newAccountCode.placeholder      = 'e.g. ADMIN02';
      } else {
        newAccountCodeLabel.textContent = 'Employee Code *';
        newAccountCode.placeholder      = 'e.g. EMP004';
      }
    });
  }

  if (toggleNewUserPassBtn && newAccountPassword) {
    toggleNewUserPassBtn.addEventListener('click', () => {
      const isPass = newAccountPassword.type === 'password';
      newAccountPassword.type = isPass ? 'text' : 'password';
    });
  }

  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearCredentialAlert();

      const role     = newAccountRole.value;
      const empCode  = newAccountCode.value.trim().toUpperCase();
      const fullName = newAccountFullName.value.trim();
      const username = newAccountUsername.value.trim().toLowerCase();
      const password = newAccountPassword.value;

      if (!empCode || !fullName || !username || !password) {
        showCredentialAlert('All fields are required to provision a credential.');
        return;
      }

      AutoLead.setButtonLoading(createUserSubmitBtn, true, 'Provisioning...');

      try {
        const res = await AutoLead.apiFetch('../api/admin_api.php?action=create_user', {
          method: 'POST',
          body: JSON.stringify({
            action: 'create_user',
            role,
            employee_code: empCode,
            full_name: fullName,
            username,
            password
          })
        });

        showCredentialAlert(res.message, true);
        AutoLead.showToast(res.message, 'success');
        createUserForm.reset();
        newAccountCodeLabel.textContent = 'Employee Code *';
        newAccountCode.placeholder      = 'e.g. EMP004';

        if (res.employees) {
          renderDynamicEmployeeNav(res.employees);
        }
        if (res.users_list) {
          renderRegisteredUsersTable(res.users_list);
        }
      } catch (err) {
        showCredentialAlert(err.message || 'Failed to provision account.');
      } finally {
        AutoLead.setButtonLoading(createUserSubmitBtn, false);
      }
    });
  }

  loadDashboardData(newLeadsFilter ? newLeadsFilter.value : 'week');
});