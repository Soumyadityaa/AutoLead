/**
 * Employee Personalized Workspace ("My Workspace") Controller
 * Path: C:/xampp/htdocs/autolead/js/employee/dashboard.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const employeeUserBadge      = document.getElementById('employeeUserBadge');
  const workspaceGreetingTag   = document.getElementById('workspaceGreetingTag');
  const workspaceHeading       = document.getElementById('workspaceHeading');
  const activeQueueCountBadge  = document.getElementById('activeQueueCountBadge');
  const exhaustLeadSelector    = document.getElementById('exhaustLeadSelector');
  const completeTaskExhaustBtn = document.getElementById('completeTaskExhaustBtn');
  const myLeadFunnelBody       = document.getElementById('myLeadFunnelBody');
  const myNewLeadsBody         = document.getElementById('myNewLeadsBody');
  const recentlyAssignedBody   = document.getElementById('recentlyAssignedBody');
  const overdueTasksBody       = document.getElementById('overdueTasksBody');
  const globalEmployeeSearch   = document.getElementById('globalEmployeeSearch');

  let personalGrowthChart = null;
  let workspaceCache = {
    funnel: [],
    newLeads: [],
    recent: [],
    overdue: []
  };

  /**
   * Render 4-Week Personal Lead Growth Chart
   */
  function renderPersonalGrowthChart(labels, values) {
    const canvas = document.getElementById('myLeadGrowthChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const tokens = AutoLead.getChartThemeTokens();

    if (personalGrowthChart) {
      personalGrowthChart.data.labels = labels;
      personalGrowthChart.data.datasets[0].data = values;
      personalGrowthChart.update();
      return;
    }

    personalGrowthChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'My Assigned Leads (4-Week Growth)',
            data: values,
            borderColor: tokens.primary,
            backgroundColor: 'rgba(29, 169, 232, 0.16)',
            borderWidth: 3,
            pointBackgroundColor: tokens.primary,
            pointRadius: 4,
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
    if (!personalGrowthChart) return;
    personalGrowthChart.options.plugins.legend.labels.color = tokens.textColor;
    personalGrowthChart.options.scales.x.grid.color = tokens.gridColor;
    personalGrowthChart.options.scales.x.ticks.color = tokens.textColor;
    personalGrowthChart.options.scales.y.grid.color = tokens.gridColor;
    personalGrowthChart.options.scales.y.ticks.color = tokens.textColor;
    personalGrowthChart.update();
  });

  /**
   * Populate active lead selector for COMPLETE TASK exhaustion trigger
   */
  function renderExhaustSelector(funnelLeads) {
    if (!funnelLeads || funnelLeads.length === 0) {
      exhaustLeadSelector.innerHTML = `<option value="0">All active leads exhausted</option>`;
      completeTaskExhaustBtn.disabled = true;
      return;
    }

    completeTaskExhaustBtn.disabled = false;
    exhaustLeadSelector.innerHTML = funnelLeads
      .map(
        (lead) =>
          `<option value="${Number(lead.id)}">
             ${AutoLead.escapeHtml(lead.lead_name)} (${AutoLead.escapeHtml(lead.lead_stage)})
           </option>`
      )
      .join('');
  }

  /**
   * Render all 4 workspace queues (with optional client-side search filter)
   */
  function renderWorkspaceTables(query = '') {
    const q = query.trim().toLowerCase();

    const filterFn = (item) => {
      if (!q) return true;
      return (
        (item.lead_name && item.lead_name.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.lead_stage && item.lead_stage.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.task_code && item.task_code.toLowerCase().includes(q))
      );
    };

    const funnelRows  = workspaceCache.funnel.filter(filterFn);
    const newLeadRows = workspaceCache.newLeads.filter(filterFn);
    const recentRows  = workspaceCache.recent.filter(filterFn);
    const overdueRows = workspaceCache.overdue.filter(filterFn);

    // 1. My Lead Funnel
    if (funnelRows.length === 0) {
      myLeadFunnelBody.innerHTML = `<tr><td colspan="4" class="empty-state">No active leads in funnel.</td></tr>`;
    } else {
      myLeadFunnelBody.innerHTML = funnelRows
        .map((row) => {
          const scoreClass = AutoLead.getScoreBadgeClass(row.lead_score);
          const stageClass = AutoLead.getStageBadgeClass(row.lead_stage);
          return `
            <tr class="${Number(row.is_escalated) === 1 ? 'row-escalated' : ''}">
              <td>
                <strong>${AutoLead.escapeHtml(row.lead_name)}</strong>
                ${Number(row.is_escalated) === 1 ? '<span class="badge badge-warning">Priority</span>' : ''}
              </td>
              <td>${AutoLead.escapeHtml(row.source)}</td>
              <td><span class="${scoreClass}">${Number(row.lead_score)}</span></td>
              <td><span class="${stageClass}">${AutoLead.escapeHtml(row.lead_stage)}</span></td>
            </tr>
          `;
        })
        .join('');
    }

    // 2. My New Leads
    if (newLeadRows.length === 0) {
      myNewLeadsBody.innerHTML = `<tr><td colspan="4" class="empty-state">No uncontacted New leads in queue.</td></tr>`;
    } else {
      myNewLeadsBody.innerHTML = newLeadRows
        .map((row) => {
          const scoreClass = AutoLead.getScoreBadgeClass(row.lead_score);
          return `
            <tr>
              <td><strong>${AutoLead.escapeHtml(row.lead_name)}</strong></td>
              <td>${AutoLead.escapeHtml(row.source)}</td>
              <td><span class="${scoreClass}">${Number(row.lead_score)}</span></td>
              <td>${AutoLead.escapeHtml(row.created_formatted)}</td>
            </tr>
          `;
        })
        .join('');
    }

    // 3. Recently Assigned Leads
    if (recentRows.length === 0) {
      recentlyAssignedBody.innerHTML = `<tr><td colspan="3" class="empty-state">No recent lead assignments.</td></tr>`;
    } else {
      recentlyAssignedBody.innerHTML = recentRows
        .map((row) => {
          const stageClass = AutoLead.getStageBadgeClass(row.lead_stage);
          return `
            <tr>
              <td><strong>${AutoLead.escapeHtml(row.lead_name)}</strong></td>
              <td><span class="${stageClass}">${AutoLead.escapeHtml(row.lead_stage)}</span></td>
              <td>${AutoLead.escapeHtml(row.assigned_formatted)}</td>
            </tr>
          `;
        })
        .join('');
    }

    // 4. Overdue Tasks (Highlighted in Red)
    if (overdueRows.length === 0) {
      overdueTasksBody.innerHTML = `<tr><td colspan="4" class="empty-state">Zero overdue tasks. All deadlines on track.</td></tr>`;
    } else {
      overdueTasksBody.innerHTML = overdueRows
        .map(
          (task) => `
            <tr class="row-overdue">
              <td><strong>${AutoLead.escapeHtml(task.task_code)}</strong></td>
              <td>${AutoLead.escapeHtml(task.subject)}</td>
              <td>${AutoLead.escapeHtml(task.lead_name)}</td>
              <td>${AutoLead.escapeHtml(task.due_formatted)}</td>
            </tr>
          `
        )
        .join('');
    }
  }

  /**
   * Fetch Employee Workspace Data
   */
  async function loadEmployeeWorkspace() {
    try {
      const data = await AutoLead.apiFetch('../api/employee_api.php?action=dashboard');

      if (data.employee) {
        employeeUserBadge.textContent    = data.employee.employee_code;
        workspaceGreetingTag.textContent = `${data.employee.employee_code} • ${data.employee.full_name}`;
        workspaceHeading.textContent     = `My Workspace (${data.employee.full_name})`;
      }

      activeQueueCountBadge.textContent = `${Number(data.active_queue_count || 0)} Active in Queue`;

      if (data.growth_chart) {
        renderPersonalGrowthChart(data.growth_chart.labels, data.growth_chart.values);
      }

      workspaceCache.funnel   = data.my_lead_funnel || [];
      workspaceCache.newLeads = data.my_new_leads || [];
      workspaceCache.recent   = data.recently_assigned || [];
      workspaceCache.overdue  = data.overdue_tasks || [];

      renderExhaustSelector(workspaceCache.funnel);
      renderWorkspaceTables(globalEmployeeSearch ? globalEmployeeSearch.value : '');
    } catch (err) {
      AutoLead.showToast(err.message || 'Unable to load employee workspace.', 'danger');
    }
  }

  // Prominent COMPLETE TASK (Lead Exhaustion) Button Handler
  completeTaskExhaustBtn.addEventListener('click', async () => {
    const selectedLeadId = Number(exhaustLeadSelector.value) || 0;
    AutoLead.setButtonLoading(completeTaskExhaustBtn, true, 'Processing...');

    try {
      const res = await AutoLead.apiFetch('../api/employee_api.php?action=complete_task_exhaustion', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete_task_exhaustion',
          lead_id: selectedLeadId
        })
      });

      AutoLead.showToast(res.message, 'success');
      await loadEmployeeWorkspace();
    } catch (err) {
      AutoLead.showToast(err.message, 'danger');
    } finally {
      AutoLead.setButtonLoading(completeTaskExhaustBtn, false);
    }
  });

  if (globalEmployeeSearch) {
    globalEmployeeSearch.addEventListener('input', () => {
      renderWorkspaceTables(globalEmployeeSearch.value);
    });
  }

  loadEmployeeWorkspace();
});