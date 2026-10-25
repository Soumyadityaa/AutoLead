/**
 * Shared Employee Controller for Manage Lead, Manage Activity, and Manage Task
 * Path: C:/xampp/htdocs/autolead/js/employee/manage-tables.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const pageType          = document.body.getAttribute('data-page');
  const employeeUserBadge = document.getElementById('employeeUserBadge');
  const searchInput       = document.getElementById('manageTableSearch');

  // ==========================================================================
  // 1. MANAGE LEAD PAGE (employee/manage-lead.html)
  // ==========================================================================
  if (pageType === 'manage-lead') {
    const tableBody  = document.getElementById('manageLeadsTableBody');
    const countBadge = document.getElementById('manageLeadCountBadge');
    let cachedLeads  = [];

    function stageCssSlug(stage) {
      return String(stage || 'New').replace(/\s+/g, '-');
    }

    function renderManageLeads(rows) {
      countBadge.textContent = `${rows.length} ${rows.length === 1 ? 'Lead' : 'Leads'}`;
      if (rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads match your search criteria.</td></tr>`;
        return;
      }

      const stages = ['New', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost'];

      tableBody.innerHTML = rows
        .map((lead) => {
          const scoreClass = AutoLead.getScoreBadgeClass(lead.lead_score);
          const slug       = stageCssSlug(lead.lead_stage);
          const options    = stages
            .map((st) => `<option value="${st}" ${lead.lead_stage === st ? 'selected' : ''}>${st}</option>`)
            .join('');

          return `
            <tr data-lead-id="${Number(lead.id)}">
              <td><strong>${AutoLead.escapeHtml(lead.lead_name)}</strong></td>
              <td><span class="${scoreClass}">${Number(lead.lead_score)} / 100</span></td>
              <td>
                <select
                  class="form-select stage-select stage-${slug} js-lead-stage-select"
                  data-lead-id="${Number(lead.id)}"
                  aria-label="Lead Stage"
                >
                  ${options}
                </select>
              </td>
              <td><span class="badge badge-neutral">${AutoLead.escapeHtml(lead.assigned_to)}</span></td>
              <td class="js-modified-col">${AutoLead.escapeHtml(lead.modified_formatted)}</td>
              <td>${AutoLead.escapeHtml(lead.created_formatted)}</td>
            </tr>
          `;
        })
        .join('');
    }

    async function loadManageLeads() {
      try {
        const data = await AutoLead.apiFetch('../api/employee_api.php?action=manage_leads');
        if (data.employee && employeeUserBadge) {
          employeeUserBadge.textContent = data.employee.employee_code;
        }
        cachedLeads = data.leads || [];
        renderManageLeads(cachedLeads);
      } catch (err) {
        AutoLead.showToast(err.message || 'Failed to load leads.', 'danger');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = cachedLeads.filter(
          (l) =>
            l.lead_name.toLowerCase().includes(q) ||
            l.lead_stage.toLowerCase().includes(q) ||
            String(l.lead_score).includes(q)
        );
        renderManageLeads(filtered);
      });
    }

    tableBody.addEventListener('change', async (e) => {
      const selectEl = e.target.closest('.js-lead-stage-select');
      if (!selectEl) return;

      const leadId   = Number(selectEl.getAttribute('data-lead-id'));
      const newStage = selectEl.value;
      const slug     = stageCssSlug(newStage);

      selectEl.className = `form-select stage-select stage-${slug} js-lead-stage-select`;

      try {
        const res = await AutoLead.apiFetch('../api/employee_api.php?action=update_lead_stage', {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_lead_stage',
            lead_id: leadId,
            lead_stage: newStage
          })
        });

        const row = selectEl.closest('tr');
        if (row) {
          const modCell = row.querySelector('.js-modified-col');
          if (modCell) {
            modCell.textContent = res.modified_formatted || 'Just now';
            modCell.classList.add('just-now-flash');
          }
        }

        const cachedItem = cachedLeads.find((item) => Number(item.id) === leadId);
        if (cachedItem) {
          cachedItem.lead_stage         = newStage;
          cachedItem.modified_formatted = 'Just now';
        }

        AutoLead.showToast(res.message, 'success');
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
      }
    });

    loadManageLeads();
  }

  // ==========================================================================
  // 2. MANAGE ACTIVITY PAGE (employee/manage-activity.html)
  // ==========================================================================
  if (pageType === 'manage-activity') {
    const tableBody          = document.getElementById('manageActivityTableBody');
    const countBadge         = document.getElementById('manageActivityCountBadge');
    const addActivityForm    = document.getElementById('employeeAddActivityForm');
    const activityLeadSelect = document.getElementById('activityLeadSelect');
    const addSubmitBtn       = document.getElementById('addActivitySubmitBtn');
    let cachedActivities     = [];

    function renderManageActivities(rows) {
      countBadge.textContent = `${rows.length} ${rows.length === 1 ? 'Activity' : 'Activities'}`;
      if (rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No interaction logs match your search query.</td></tr>`;
        return;
      }

      const statuses = ['Scheduled', 'Pending', 'Completed', 'Cancelled'];

      tableBody.innerHTML = rows
        .map((act) => {
          const options = statuses
            .map((st) => `<option value="${st}" ${act.resolution_status === st ? 'selected' : ''}>${st}</option>`)
            .join('');

          return `
            <tr data-interaction-id="${Number(act.id)}">
              <td><strong>${AutoLead.escapeHtml(act.lead_name)}</strong></td>
              <td>
                <span class="badge badge-neutral">${AutoLead.escapeHtml(act.interaction_type)}</span>
                <span>${AutoLead.escapeHtml(act.notes)}</span>
              </td>
              <td class="js-activity-date-col">${AutoLead.escapeHtml(act.activity_date_formatted)}</td>
              <td><span class="badge badge-neutral">${AutoLead.escapeHtml(act.employee_code)}</span></td>
              <td>
                <select
                  class="form-select resolution-select res-${AutoLead.escapeHtml(act.resolution_status)} js-resolution-select"
                  data-interaction-id="${Number(act.id)}"
                  aria-label="Activity Resolution Status"
                >
                  ${options}
                </select>
              </td>
            </tr>
          `;
        })
        .join('');
    }

    async function loadManageActivities() {
      try {
        const data = await AutoLead.apiFetch('../api/employee_api.php?action=manage_activities');
        if (data.employee && employeeUserBadge) {
          employeeUserBadge.textContent = data.employee.employee_code;
        }
        if (data.assigned_leads && activityLeadSelect) {
          activityLeadSelect.innerHTML = data.assigned_leads
            .map(
              (l) =>
                `<option value="${Number(l.id)}">${AutoLead.escapeHtml(l.lead_name)} (${AutoLead.escapeHtml(l.lead_stage)})</option>`
            )
            .join('');
        }
        cachedActivities = data.activities || [];
        renderManageActivities(cachedActivities);
      } catch (err) {
        AutoLead.showToast(err.message || 'Failed to load activities.', 'danger');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = cachedActivities.filter(
          (a) =>
            a.lead_name.toLowerCase().includes(q) ||
            a.notes.toLowerCase().includes(q) ||
            a.resolution_status.toLowerCase().includes(q)
        );
        renderManageActivities(filtered);
      });
    }

    if (addActivityForm) {
      addActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const notesInput = document.getElementById('activityNotesInput');
        const notes      = notesInput.value.trim();
        if (!notes) return;

        AutoLead.setButtonLoading(addSubmitBtn, true, 'Processing...');
        try {
          const res = await AutoLead.apiFetch('../api/employee_api.php?action=add_activity', {
            method: 'POST',
            body: JSON.stringify({
              action: 'add_activity',
              lead_id: Number(activityLeadSelect.value),
              interaction_type: document.getElementById('activityTypeSelect').value,
              resolution_status: document.getElementById('activityResolutionSelect').value,
              notes
            })
          });
          notesInput.value = '';
          AutoLead.showToast(res.message, 'success');
          await loadManageActivities();
        } catch (err) {
          AutoLead.showToast(err.message, 'danger');
        } finally {
          AutoLead.setButtonLoading(addSubmitBtn, false);
        }
      });
    }

    tableBody.addEventListener('change', async (e) => {
      const selectEl = e.target.closest('.js-resolution-select');
      if (!selectEl) return;

      const interactionId = Number(selectEl.getAttribute('data-interaction-id'));
      const newRes        = selectEl.value;

      selectEl.className = `form-select resolution-select res-${newRes} js-resolution-select`;

      try {
        const res = await AutoLead.apiFetch('../api/employee_api.php?action=update_activity_resolution', {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_activity_resolution',
            interaction_id: interactionId,
            resolution_status: newRes
          })
        });

        const row = selectEl.closest('tr');
        if (row) {
          const dateCell = row.querySelector('.js-activity-date-col');
          if (dateCell) {
            dateCell.textContent = res.activity_date_formatted || 'Just now';
            dateCell.classList.add('just-now-flash');
          }
        }

        AutoLead.showToast(res.message, 'success');
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
      }
    });

    loadManageActivities();
  }

  // ==========================================================================
  // 3. MANAGE TASK PAGE (employee/manage-task.html)
  // ==========================================================================
  if (pageType === 'manage-task') {
    const tableBody  = document.getElementById('manageTaskTableBody');
    const countBadge = document.getElementById('manageTaskCountBadge');
    let cachedTasks  = [];

    function renderManageTasks(rows) {
      countBadge.textContent = `${rows.length} ${rows.length === 1 ? 'Task' : 'Tasks'}`;
      if (rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No tasks match your search query.</td></tr>`;
        return;
      }

      const statuses = ['Pending', 'Complete', 'Overdue'];

      tableBody.innerHTML = rows
        .map((task) => {
          const isOverdue = Boolean(task.is_overdue) && task.status !== 'Complete';
          const rowClass  = isOverdue ? 'row-overdue' : '';
          const options   = statuses
            .map((st) => `<option value="${st}" ${task.status === st ? 'selected' : ''}>${st}</option>`)
            .join('');

          const remActive = Number(task.reminder_active) === 1;
          const remBadgeClass = remActive ? 'badge badge-warning' : 'badge badge-neutral';

          return `
            <tr class="${rowClass}" data-task-id="${Number(task.id)}">
              <td><span class="task-id-code">${AutoLead.escapeHtml(task.task_code)}</span></td>
              <td>
                <strong>${AutoLead.escapeHtml(task.subject)}</strong>
                <div style="font-size: 0.76rem; color: var(--text-muted);">Lead: ${AutoLead.escapeHtml(task.lead_name)}</div>
              </td>
              <td>
                <select
                  class="form-select emp-task-select task-${AutoLead.escapeHtml(task.status)} js-emp-task-status"
                  data-task-id="${Number(task.id)}"
                  aria-label="Task Status"
                >
                  ${options}
                </select>
              </td>
              <td>${AutoLead.escapeHtml(task.due_formatted)}</td>
              <td>
                <span class="${remBadgeClass} js-task-reminder-badge">
                  ${remActive ? 'On' : 'Off'}
                </span>
              </td>
              <td><span class="badge badge-neutral">${AutoLead.escapeHtml(task.assigned_to)}</span></td>
            </tr>
          `;
        })
        .join('');
    }

    async function loadManageTasks() {
      try {
        const data = await AutoLead.apiFetch('../api/employee_api.php?action=manage_tasks');
        if (data.employee && employeeUserBadge) {
          employeeUserBadge.textContent = data.employee.employee_code;
        }
        cachedTasks = data.tasks || [];
        renderManageTasks(cachedTasks);
      } catch (err) {
        AutoLead.showToast(err.message || 'Failed to load tasks.', 'danger');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = cachedTasks.filter(
          (t) =>
            t.task_code.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.lead_name.toLowerCase().includes(q) ||
            t.status.toLowerCase().includes(q)
        );
        renderManageTasks(filtered);
      });
    }

    tableBody.addEventListener('change', async (e) => {
      const selectEl = e.target.closest('.js-emp-task-status');
      if (!selectEl) return;

      const taskId    = Number(selectEl.getAttribute('data-task-id'));
      const newStatus = selectEl.value;
      const row       = selectEl.closest('tr');

      selectEl.className = `form-select emp-task-select task-${newStatus} js-emp-task-status`;

      try {
        const res = await AutoLead.apiFetch('../api/employee_api.php?action=update_task', {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_task',
            task_id: taskId,
            status: newStatus
          })
        });

        if (row) {
          // Selecting Complete immediately strips red overdue warning classes and sets reminder badge to Off
          if (newStatus === 'Complete') {
            row.classList.remove('row-overdue');
          } else if (newStatus === 'Overdue') {
            row.classList.add('row-overdue');
          }

          const remBadge = row.querySelector('.js-task-reminder-badge');
          if (remBadge) {
            remBadge.textContent = res.reminder_label || (newStatus === 'Complete' ? 'Off' : 'On');
            remBadge.className   =
              Number(res.reminder_active) === 1
                ? 'badge badge-warning js-task-reminder-badge'
                : 'badge badge-neutral js-task-reminder-badge';
          }
        }

        const cachedItem = cachedTasks.find((t) => Number(t.id) === taskId);
        if (cachedItem) {
          cachedItem.status          = newStatus;
          cachedItem.is_overdue      = newStatus === 'Overdue';
          cachedItem.reminder_active = res.reminder_active;
        }

        AutoLead.showToast(res.message, 'success');
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
      }
    });

    loadManageTasks();
  }
});