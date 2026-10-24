/**
 * Admin Global Tasks Controller
 * Path: C:/xampp/htdocs/autolead/js/admin/tasks.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const adminTasksTableBody   = document.getElementById('adminTasksTableBody');
  const tasksTotalBadge       = document.getElementById('tasksTotalBadge');
  const tasksPageHeading      = document.getElementById('tasksPageHeading');
  const btnFilterAllTasks     = document.getElementById('btnFilterAllTasks');
  const btnFilterOverdueTasks = document.getElementById('btnFilterOverdueTasks');
  const taskEmployeeFilter    = document.getElementById('taskEmployeeFilter');
  const navTaskAll            = document.getElementById('navTaskAll');
  const navTaskOverdue        = document.getElementById('navTaskOverdue');
  const empNavDropdown        = document.getElementById('empNavDropdown');
  const empNavTrigger         = document.getElementById('empNavTrigger');

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

  const urlParams = new URLSearchParams(window.location.search);
  let activeFilter = (urlParams.get('filter') || 'all').toLowerCase();

  function syncFilterUi() {
    if (activeFilter === 'overdue') {
      btnFilterOverdueTasks.classList.add('active-pill');
      btnFilterAllTasks.classList.remove('active-pill');
      navTaskOverdue.classList.add('active');
      navTaskAll.classList.remove('active');
      tasksPageHeading.textContent = 'Overdue Tasks Escalation Board';
    } else {
      btnFilterAllTasks.classList.add('active-pill');
      btnFilterOverdueTasks.classList.remove('active-pill');
      navTaskAll.classList.add('active');
      navTaskOverdue.classList.remove('active');
      tasksPageHeading.textContent = 'System-Wide Task Management';
    }
  }

  /**
   * Render global tasks table rows
   */
  function renderTasksTable(tasks) {
    tasksTotalBadge.textContent = `${tasks.length} ${tasks.length === 1 ? 'Task' : 'Tasks'}`;

    if (!tasks || tasks.length === 0) {
      adminTasksTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">No tasks match the selected filter criteria.</td>
        </tr>`;
      return;
    }

    const statuses = ['Pending', 'Complete', 'Overdue'];

    adminTasksTableBody.innerHTML = tasks
      .map((task) => {
        const isOverdue = Boolean(task.is_overdue) && task.status !== 'Complete';
        const rowClass  = isOverdue ? 'row-overdue' : '';

        const statusOptions = statuses
          .map(
            (st) =>
              `<option value="${st}" ${task.status === st ? 'selected' : ''}>${st}</option>`
          )
          .join('');

        const reminderBadge =
          Number(task.reminder_active) === 1
            ? `<span class="badge badge-warning js-reminder-badge">Active</span>`
            : `<span class="badge badge-neutral js-reminder-badge">Off</span>`;

        return `
          <tr class="${rowClass}" data-task-id="${Number(task.id)}">
            <td><span class="task-code-pill">${AutoLead.escapeHtml(task.task_code)}</span></td>
            <td><strong>${AutoLead.escapeHtml(task.subject)}</strong></td>
            <td>
              <a href="lead-preview.html?lead_id=${Number(task.lead_id)}" class="lead-link">
                ${AutoLead.escapeHtml(task.lead_name)}
              </a>
            </td>
            <td>${AutoLead.escapeHtml(task.due_formatted)}</td>
            <td>${AutoLead.escapeHtml(task.source)}</td>
            <td>
              <select
                class="form-select task-status-select status-${AutoLead.escapeHtml(task.status)} js-admin-task-status"
                data-task-id="${Number(task.id)}"
                aria-label="Task Status"
              >
                ${statusOptions}
              </select>
            </td>
            <td>${reminderBadge}</td>
            <td>
              <a href="employee-monitoring.html?employee_code=${encodeURIComponent(task.assigned_to)}" class="badge badge-neutral">
                ${AutoLead.escapeHtml(task.assigned_to)} - ${AutoLead.escapeHtml(task.assigned_name || '')}
              </a>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Load tasks from Admin API
   */
async function loadTasks() {
    syncFilterUi();
    const empCode = taskEmployeeFilter.value || 'ALL';
    try {
      const data = await AutoLead.apiFetch(
        `../api/admin_api.php?action=tasks&filter=${encodeURIComponent(activeFilter)}&employee_code=${encodeURIComponent(empCode)}`
      );

      if (Array.isArray(data.employees)) {
        taskEmployeeFilter.innerHTML =
          `<option value="ALL">All Employees</option>` +
          data.employees
            .map(
              (emp) =>
                `<option value="${AutoLead.escapeHtml(emp.employee_code)}" ${
                  emp.employee_code === empCode ? 'selected' : ''
                }>${AutoLead.escapeHtml(emp.employee_code)} - ${AutoLead.escapeHtml(emp.full_name)}</option>`
            )
            .join('');
      }

      renderTasksTable(data.tasks || []);
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load tasks.', 'danger');
    }
  }

  btnFilterAllTasks.addEventListener('click', () => {
    activeFilter = 'all';
    window.history.replaceState({}, '', 'tasks.html');
    loadTasks();
  });

  btnFilterOverdueTasks.addEventListener('click', () => {
    activeFilter = 'overdue';
    window.history.replaceState({}, '', 'tasks.html?filter=overdue');
    loadTasks();
  });

  taskEmployeeFilter.addEventListener('change', loadTasks);

  // Event Delegation for Task Status Intervention Dropdown
  adminTasksTableBody.addEventListener('change', async (e) => {
    const selectEl = e.target.closest('.js-admin-task-status');
    if (!selectEl) return;

    const taskId    = Number(selectEl.getAttribute('data-task-id'));
    const newStatus = selectEl.value;
    const row       = selectEl.closest('tr');

    selectEl.className = `form-select task-status-select status-${newStatus} js-admin-task-status`;

    try {
      const res = await AutoLead.apiFetch('../api/admin_api.php?action=update_task_status', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_task_status',
          task_id: taskId,
          status: newStatus
        })
      });

      if (row) {
        if (newStatus === 'Complete') {
          row.classList.remove('row-overdue');
        } else if (newStatus === 'Overdue') {
          row.classList.add('row-overdue');
        }

        const remBadge = row.querySelector('.js-reminder-badge');
        if (remBadge) {
          remBadge.textContent = Number(res.reminder_active) === 1 ? 'Active' : 'Off';
          remBadge.className =
            Number(res.reminder_active) === 1
              ? 'badge badge-warning js-reminder-badge'
              : 'badge badge-neutral js-reminder-badge';
        }
      }

      AutoLead.showToast(res.message, 'success');
    } catch (err) {
      AutoLead.showToast(err.message, 'danger');
    }
  });

  loadTasks();
});