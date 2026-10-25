/**
 * Admin Employee Monitoring & Override Controller
 * Path: C:/xampp/htdocs/autolead/js/admin/employee-monitoring.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const employeeCodeFilter      = document.getElementById('employeeCodeFilter');
  const monitoringSearchInput   = document.getElementById('monitoringSearchInput');
  const employeeMonitoringBody  = document.getElementById('employeeMonitoringBody');
  const monitoringTableHeading  = document.getElementById('monitoringTableHeading');
  const monitoringCountBadge    = document.getElementById('monitoringCountBadge');
  const empNavDropdown          = document.getElementById('empNavDropdown');
  const empNavTrigger           = document.getElementById('empNavTrigger');

  let cachedLeads = [];

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

  // Read initial employee_code from URL query string if present
  const urlParams = new URLSearchParams(window.location.search);
  const initialCode = (urlParams.get('employee_code') || 'ALL').toUpperCase();
  if (employeeCodeFilter) {
    employeeCodeFilter.value = ['ALL', 'EMP001', 'EMP002', 'EMP003'].includes(initialCode)
      ? initialCode
      : 'ALL';
  }

  /**
   * Render employee monitoring table rows
   */
  function renderMonitoringTable(rows) {
    monitoringCountBadge.textContent = `${rows.length} ${rows.length === 1 ? 'Lead' : 'Leads'}`;

    if (rows.length === 0) {
      employeeMonitoringBody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-state">No assigned leads match the current employee filter or search query.</td>
        </tr>`;
      return;
    }

    const statuses = ['Active', 'Inactive', 'Pending', 'Checked'];

    employeeMonitoringBody.innerHTML = rows
      .map((lead) => {
        const scoreClass = AutoLead.getScoreBadgeClass(lead.lead_score);
        const stageClass = AutoLead.getStageBadgeClass(lead.lead_stage);
        const rowClass   = Number(lead.is_escalated) === 1 ? 'row-escalated' : '';

        const statusOptions = statuses
          .map(
            (st) =>
              `<option value="${st}" ${lead.activity_status === st ? 'selected' : ''}>${st}</option>`
          )
          .join('');

        return `
          <tr class="${rowClass}" data-lead-id="${Number(lead.id)}">
            <td>
              <a href="lead-preview.html?lead_id=${Number(lead.id)}" class="lead-link">
                <span>${AutoLead.escapeHtml(lead.lead_name)}</span>
              </a>
              ${Number(lead.is_escalated) === 1 ? '<span class="badge badge-warning">Escalated</span>' : ''}
            </td>
            <td>
              <span class="badge badge-neutral">${AutoLead.escapeHtml(lead.assigned_to)}</span>
            </td>
            <td>${AutoLead.escapeHtml(lead.source)}</td>
            <td><span class="${scoreClass}">${Number(lead.lead_score)}</span></td>
            <td><span class="${stageClass}">${AutoLead.escapeHtml(lead.lead_stage)}</span></td>
            <td>
              <span class="badge badge-info">${Number(lead.total_calls)} Calls / ${Number(lead.total_interactions)} Logs</span>
            </td>
            <td class="audit-note-cell">${AutoLead.escapeHtml(lead.latest_note)}</td>
            <td>
              <select
                class="form-select activity-select status-${AutoLead.escapeHtml(lead.activity_status)} js-activity-select"
                data-lead-id="${Number(lead.id)}"
                aria-label="Activity Status"
              >
                ${statusOptions}
              </select>
            </td>
            <td class="js-modified-cell">${AutoLead.escapeHtml(lead.modified_formatted)}</td>
            <td>
              <div class="override-btn-group">
                <button
                  type="button"
                  class="btn btn-sm btn-send-override js-send-lead"
                  data-lead-id="${Number(lead.id)}"
                  title="Escalate &amp; Dispatch Priority Task to Employee"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <span>Send</span>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger js-delete-lead"
                  data-lead-id="${Number(lead.id)}"
                  title="Permanently Delete Lead Record"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Filter cached leads by client-side search query
   */
  function applySearchFilter() {
    const query = (monitoringSearchInput.value || '').trim().toLowerCase();
    if (!query) {
      renderMonitoringTable(cachedLeads);
      return;
    }

    const filtered = cachedLeads.filter((item) => {
      return (
        item.lead_name.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.assigned_to.toLowerCase().includes(query) ||
        (item.latest_note && item.latest_note.toLowerCase().includes(query))
      );
    });
    renderMonitoringTable(filtered);
  }

  /**
   * Fetch leads for selected Employee Code
   */
async function loadEmployeePipeline(empCode = 'ALL') {
    try {
      const data = await AutoLead.apiFetch(
        `../api/admin_api.php?action=employee_monitoring&employee_code=${encodeURIComponent(empCode)}`
      );

      // Dynamically sync both the page filter dropdown and top navbar Employee Code menu
      if (Array.isArray(data.employees)) {
        const currentSelected = data.selected_code || empCode || 'ALL';
        employeeCodeFilter.innerHTML =
          `<option value="ALL">All Employees (Global View)</option>` +
          data.employees
            .map(
              (emp) =>
                `<option value="${AutoLead.escapeHtml(emp.employee_code)}" ${
                  emp.employee_code === currentSelected ? 'selected' : ''
                }>${AutoLead.escapeHtml(emp.employee_code)} - ${AutoLead.escapeHtml(emp.full_name)}</option>`
            )
            .join('');

        const empNavMenu = document.getElementById('empNavMenu');
        if (empNavMenu) {
          empNavMenu.innerHTML =
            `<a href="employee-monitoring.html?employee_code=ALL" class="nav-dropdown-item">All Employees</a>` +
            data.employees
              .map(
                (emp) =>
                  `<a href="employee-monitoring.html?employee_code=${encodeURIComponent(
                    emp.employee_code
                  )}" class="nav-dropdown-item">${AutoLead.escapeHtml(emp.employee_code)} - ${AutoLead.escapeHtml(
                    emp.full_name
                  )}</a>`
              )
              .join('');
        }
      }

      cachedLeads = data.leads || [];
      monitoringTableHeading.textContent =
        empCode === 'ALL'
          ? 'Assigned Lead Records (All Employees)'
          : `Assigned Lead Pipeline for ${empCode}`;
      applySearchFilter();
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load employee monitoring data.', 'danger');
    }
  }

  // Employee Code dropdown filter listener
  employeeCodeFilter.addEventListener('change', () => {
    const code = employeeCodeFilter.value;
    const newUrl = `${window.location.pathname}?employee_code=${encodeURIComponent(code)}`;
    window.history.replaceState({}, '', newUrl);
    loadEmployeePipeline(code);
  });

  // Search input listener
  monitoringSearchInput.addEventListener('input', applySearchFilter);

  // Event Delegation for Activity Status Dropdown Change
  employeeMonitoringBody.addEventListener('change', async (e) => {
    const selectEl = e.target.closest('.js-activity-select');
    if (!selectEl) return;

    const leadId    = Number(selectEl.getAttribute('data-lead-id'));
    const newStatus = selectEl.value;

    selectEl.className = `form-select activity-select status-${newStatus} js-activity-select`;

    try {
      const res = await AutoLead.apiFetch('../api/admin_api.php?action=update_activity_status', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_activity_status',
          lead_id: leadId,
          activity_status: newStatus
        })
      });

      const row = selectEl.closest('tr');
      if (row) {
        const modCell = row.querySelector('.js-modified-cell');
        if (modCell) modCell.textContent = res.modified_formatted || 'Just now';
      }
      AutoLead.showToast(res.message, 'success');
    } catch (err) {
      AutoLead.showToast(err.message, 'danger');
    }
  });

  // Event Delegation for Send (Escalate) & Delete Overrides
  employeeMonitoringBody.addEventListener('click', async (e) => {
    const sendBtn   = e.target.closest('.js-send-lead');
    const deleteBtn = e.target.closest('.js-delete-lead');

    if (sendBtn) {
      const leadId = Number(sendBtn.getAttribute('data-lead-id'));
      AutoLead.setButtonLoading(sendBtn, true, 'Sending...');

      try {
        const res = await AutoLead.apiFetch('../api/admin_api.php?action=escalate_lead', {
          method: 'POST',
          body: JSON.stringify({
            action: 'escalate_lead',
            lead_id: leadId
          })
        });
        AutoLead.showToast(res.message, 'success');
        await loadEmployeePipeline(employeeCodeFilter.value);
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
      } finally {
        AutoLead.setButtonLoading(sendBtn, false);
      }
      return;
    }

    if (deleteBtn) {
      const leadId = Number(deleteBtn.getAttribute('data-lead-id'));
      AutoLead.setButtonLoading(deleteBtn, true, 'Deleting...');

      try {
        const res = await AutoLead.apiFetch('../api/admin_api.php?action=delete_lead', {
          method: 'POST',
          body: JSON.stringify({
            action: 'delete_lead',
            lead_id: leadId
          })
        });
        AutoLead.showToast(res.message, 'info');
        cachedLeads = cachedLeads.filter((l) => Number(l.id) !== leadId);
        applySearchFilter();
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
        AutoLead.setButtonLoading(deleteBtn, false);
      }
    }
  });

  loadEmployeePipeline(employeeCodeFilter.value);
});