/**
 * Employee 5-Tab Smart Views Controller
 * Path: C:/xampp/htdocs/autolead/js/employee/smart-views.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const employeeUserBadge    = document.getElementById('employeeUserBadge');
  const smartViewSearchInput = document.getElementById('smartViewSearchInput');
  const tabButtons           = document.querySelectorAll('.smart-tab-btn');
  const tabPanels            = document.querySelectorAll('.smart-tab-panel');

  const smartNewLeadBody     = document.getElementById('smartNewLeadBody');
  const smartProspectBody    = document.getElementById('smartProspectBody');
  const smartIncomingBody    = document.getElementById('smartIncomingBody');
  const smartOutgoingBody    = document.getElementById('smartOutgoingBody');
  const smartFollowupBody    = document.getElementById('smartFollowupBody');

  let smartData = {
    new_leads: [],
    prospects: [],
    incoming_calls: [],
    outgoing_calls: [],
    followups: []
  };

  // Switch cleanly across the 5 tabs without page reloads
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      tabButtons.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetTabId);
      });
    });
  });

  function renderAllTabs(searchQuery = '') {
    const q = searchQuery.trim().toLowerCase();

    const matchQuery = (obj) => {
      if (!q) return true;
      return Object.values(obj).some((val) =>
        String(val || '').toLowerCase().includes(q)
      );
    };

    const newLeads  = smartData.new_leads.filter(matchQuery);
    const prospects = smartData.prospects.filter(matchQuery);
    const incoming  = smartData.incoming_calls.filter(matchQuery);
    const outgoing  = smartData.outgoing_calls.filter(matchQuery);
    const followups = smartData.followups.filter(matchQuery);

    document.getElementById('countNewLead').textContent  = newLeads.length;
    document.getElementById('countProspect').textContent = prospects.length;
    document.getElementById('countIncoming').textContent = incoming.length;
    document.getElementById('countOutgoing').textContent = outgoing.length;
    document.getElementById('countFollowup').textContent = followups.length;

    // 1. New Lead Tab
    smartNewLeadBody.innerHTML = newLeads.length === 0
      ? `<tr><td colspan="8" class="empty-state">No New Leads found.</td></tr>`
      : newLeads
          .map(
            (l) => `
            <tr>
              <td><strong>${AutoLead.escapeHtml(l.lead_name)}</strong></td>
              <td>${AutoLead.escapeHtml(l.email)}</td>
              <td>${AutoLead.escapeHtml(l.phone)}</td>
              <td>${AutoLead.escapeHtml(l.feedback_notes)}</td>
              <td>${AutoLead.escapeHtml(l.source)}</td>
              <td><span class="${AutoLead.getScoreBadgeClass(l.lead_score)}">${Number(l.lead_score)}</span></td>
              <td>${AutoLead.escapeHtml(l.created_formatted)}</td>
              <td>${AutoLead.escapeHtml(l.modified_formatted)}</td>
            </tr>`
          )
          .join('');

    // 2. Prospect Tab
    smartProspectBody.innerHTML = prospects.length === 0
      ? `<tr><td colspan="5" class="empty-state">No Prospects in active qualification.</td></tr>`
      : prospects
          .map(
            (p) => `
            <tr>
              <td><strong>${AutoLead.escapeHtml(p.lead_name)}</strong></td>
              <td><span class="${AutoLead.getScoreBadgeClass(p.lead_score)}">${Number(p.lead_score)}</span></td>
              <td><span class="${AutoLead.getStageBadgeClass(p.lead_stage)}">${AutoLead.escapeHtml(p.lead_stage)}</span></td>
              <td><span class="badge badge-neutral">${AutoLead.escapeHtml(p.assigned_to)}</span></td>
              <td>${AutoLead.escapeHtml(p.modified_formatted)}</td>
            </tr>`
          )
          .join('');

    // 3. Incoming Calls Tab
    const renderCallRows = (calls) =>
      calls.length === 0
        ? `<tr><td colspan="6" class="empty-state">No call records found in this category.</td></tr>`
        : calls
            .map(
              (c) => `
              <tr>
                <td><strong>${AutoLead.escapeHtml(c.lead_name)}</strong></td>
                <td>${AutoLead.escapeHtml(c.start_time)}</td>
                <td><span class="badge badge-info">${AutoLead.escapeHtml(c.call_status)}</span></td>
                <td>${AutoLead.escapeHtml(c.call_duration)}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm js-play-inline-call"
                    data-lead="${AutoLead.escapeHtml(c.lead_name)}"
                    data-url="${AutoLead.escapeHtml(c.call_record_url)}"
                    data-duration="${AutoLead.escapeHtml(c.call_duration)}"
                    data-notes="${AutoLead.escapeHtml(c.notes)}"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Play (${AutoLead.escapeHtml(c.call_duration)})</span>
                  </button>
                </td>
                <td><span class="badge badge-neutral">${AutoLead.escapeHtml(c.employee_code)}</span></td>
              </tr>`
            )
            .join('');

    smartIncomingBody.innerHTML = renderCallRows(incoming);
    smartOutgoingBody.innerHTML = renderCallRows(outgoing);

    // 5. Followup Tab
    smartFollowupBody.innerHTML = followups.length === 0
      ? `<tr><td colspan="6" class="empty-state">No scheduled follow-up tasks.</td></tr>`
      : followups
          .map((t) => {
            const isOverdue = t.status === 'Overdue';
            const remOn     = Number(t.reminder_active) === 1;
            return `
              <tr class="${isOverdue ? 'row-overdue' : ''}">
                <td><strong>${AutoLead.escapeHtml(t.task_code)}</strong></td>
                <td>${AutoLead.escapeHtml(t.subject)}</td>
                <td>
                  <span class="badge ${
                    t.status === 'Complete'
                      ? 'badge-success'
                      : isOverdue
                      ? 'badge-danger'
                      : 'badge-warning'
                  }">${AutoLead.escapeHtml(t.status)}</span>
                </td>
                <td>${AutoLead.escapeHtml(t.due_formatted)}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm ${remOn ? 'btn-primary' : 'btn-secondary'} js-toggle-reminder"
                    data-task-id="${Number(t.id)}"
                    data-reminder="${remOn ? '1' : '0'}"
                  >
                    <span>${remOn ? 'Reminder: On' : 'Reminder: Off'}</span>
                  </button>
                </td>
                <td><span class="badge badge-neutral">${AutoLead.escapeHtml(t.assigned_to)}</span></td>
              </tr>
            `;
          })
          .join('');
  }

  async function loadSmartViews() {
    try {
      const data = await AutoLead.apiFetch('../api/employee_api.php?action=smart_views');
      if (data.employee && employeeUserBadge) {
        employeeUserBadge.textContent = data.employee.employee_code;
      }
      smartData = {
        new_leads: data.new_leads || [],
        prospects: data.prospects || [],
        incoming_calls: data.incoming_calls || [],
        outgoing_calls: data.outgoing_calls || [],
        followups: data.followups || []
      };
      renderAllTabs(smartViewSearchInput ? smartViewSearchInput.value : '');
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load Smart Views.', 'danger');
    }
  }

  if (smartViewSearchInput) {
    smartViewSearchInput.addEventListener('input', () => {
      renderAllTabs(smartViewSearchInput.value);
    });
  }

  // Delegate inline Call Record Play triggers & Followup Reminder toggles
  document.addEventListener('click', async (e) => {
    const playBtn = e.target.closest('.js-play-inline-call');
    if (playBtn) {
      document.getElementById('empAudioLeadName').textContent = `Call Recording: ${playBtn.getAttribute('data-lead')}`;
      document.getElementById('empAudioUrl').textContent      = playBtn.getAttribute('data-url');
      document.getElementById('empAudioDuration').textContent = playBtn.getAttribute('data-duration');
      document.getElementById('empAudioNotes').textContent    = `Call Notes: ${playBtn.getAttribute('data-notes')}`;
      AutoLead.openModal('empAudioModal');
      return;
    }

    const remBtn = e.target.closest('.js-toggle-reminder');
    if (remBtn) {
      const taskId     = Number(remBtn.getAttribute('data-task-id'));
      const currentRem = Number(remBtn.getAttribute('data-reminder'));
      const nextRem    = currentRem === 1 ? 0 : 1;

      AutoLead.setButtonLoading(remBtn, true, 'Updating...');
      try {
        const res = await AutoLead.apiFetch('../api/employee_api.php?action=update_task', {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_task',
            task_id: taskId,
            reminder_active: nextRem
          })
        });
        AutoLead.showToast(res.message, 'success');
        await loadSmartViews();
      } catch (err) {
        AutoLead.showToast(err.message, 'danger');
        AutoLead.setButtonLoading(remBtn, false);
      }
    }
  });

  loadSmartViews();
});