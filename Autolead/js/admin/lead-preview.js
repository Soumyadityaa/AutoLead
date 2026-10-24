/**
 * Admin Lead Preview, Quick Logger & Audio Waveform Controller
 * Path: C:/xampp/htdocs/autolead/js/admin/lead-preview.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const leadSelectorDropdown   = document.getElementById('leadSelectorDropdown');
  const quickInteractionForm   = document.getElementById('quickInteractionForm');
  const quickInteractionType   = document.getElementById('quickInteractionType');
  const callDurationGroup      = document.getElementById('callDurationGroup');
  const taskDueDateGroup       = document.getElementById('taskDueDateGroup');
  const quickLogSubmitBtn      = document.getElementById('quickLogSubmitBtn');
  const interactionHistoryBody = document.getElementById('interactionHistoryBody');
  const interactionCountBadge  = document.getElementById('interactionCountBadge');

  // Audio Player Modal Elements
  const waveformContainer      = document.getElementById('waveformContainer');
  const audioPlayPauseBtn      = document.getElementById('audioPlayPauseBtn');
  const audioProgressFill      = document.getElementById('audioProgressFill');
  const audioTimerDisplay      = document.getElementById('audioTimerDisplay');
  const audioProspectName      = document.getElementById('audioProspectName');
  const audioFileUrl           = document.getElementById('audioFileUrl');
  const audioTranscriptText    = document.getElementById('audioTranscriptText');
  const empNavDropdown         = document.getElementById('empNavDropdown');
  const empNavTrigger          = document.getElementById('empNavTrigger');

  let currentLeadId   = 0;
  let currentLeadName = '';
  let isAudioPlaying  = false;
  let audioTimer      = null;
  let elapsedSeconds  = 0;
  let totalSeconds    = 258;

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

  // Default task due date to +2 days
  const quickTaskDueDate = document.getElementById('quickTaskDueDate');
  if (quickTaskDueDate) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    quickTaskDueDate.value = d.toISOString().split('T')[0];
  }

  // Toggle Call Duration vs Task Due Date field based on selected interaction type
  quickInteractionType.addEventListener('change', () => {
    const val = quickInteractionType.value;
    if (val === 'Inbound Call' || val === 'Outbound Call') {
      callDurationGroup.classList.remove('hidden-field');
      taskDueDateGroup.classList.add('hidden-field');
    } else if (val === 'Task') {
      callDurationGroup.classList.add('hidden-field');
      taskDueDateGroup.classList.remove('hidden-field');
    } else {
      callDurationGroup.classList.add('hidden-field');
      taskDueDateGroup.classList.add('hidden-field');
    }
  });

  /**
   * Populate demographic snapshot card
   */
  function renderLeadDemographics(lead) {
    currentLeadId   = Number(lead.id);
    currentLeadName = lead.lead_name;

    document.getElementById('quickLeadId').value          = currentLeadId;
    document.getElementById('previewLeadName').textContent = lead.lead_name;
    document.getElementById('fieldName').textContent       = lead.lead_name;
    document.getElementById('fieldAge').textContent        = `${lead.age} Years`;
    document.getElementById('fieldGender').textContent     = lead.gender;
    document.getElementById('fieldEmail').textContent      = lead.email;
    document.getElementById('fieldPhone').textContent      = lead.phone;
    document.getElementById('fieldOwner').textContent      = `${lead.assigned_to} (${lead.owner_name || ''})`;
    document.getElementById('fieldSource').textContent     = lead.source;

    const scoreEl = document.getElementById('fieldScore');
    scoreEl.textContent = `${lead.lead_score} / 100`;
    scoreEl.className   = AutoLead.getScoreBadgeClass(lead.lead_score);

    const stageEl = document.getElementById('previewStageBadge');
    stageEl.textContent = lead.lead_stage;
    stageEl.className   = AutoLead.getStageBadgeClass(lead.lead_stage);
  }

  /**
   * Populate interaction audit trail table
   */
  function renderInteractionAuditTable(interactions) {
    interactionCountBadge.textContent = `${interactions.length} ${interactions.length === 1 ? 'Log' : 'Logs'}`;

    if (!interactions || interactions.length === 0) {
      interactionHistoryBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No interactions recorded for this prospect yet.</td>
        </tr>`;
      return;
    }

    interactionHistoryBody.innerHTML = interactions
      .map((item) => {
        const listenButton = item.has_recording
          ? `<button
               type="button"
               class="btn btn-secondary btn-sm js-listen-call"
               data-url="${AutoLead.escapeHtml(item.call_record_url)}"
               data-duration="${AutoLead.escapeHtml(item.call_duration)}"
               data-notes="${AutoLead.escapeHtml(item.notes)}"
             >
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                 <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                 <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
               </svg>
               <span>Listen (${AutoLead.escapeHtml(item.call_duration)})</span>
             </button>`
          : `<span class="badge badge-neutral">Non-Voice Log</span>`;

        return `
          <tr>
            <td><strong>${AutoLead.escapeHtml(item.date_formatted)}</strong></td>
            <td>${AutoLead.escapeHtml(item.time_formatted)}</td>
            <td>${AutoLead.escapeHtml(item.mail_sent)}</td>
            <td>${AutoLead.escapeHtml(item.inbound_call)}</td>
            <td>${AutoLead.escapeHtml(item.outbound_call)}</td>
            <td>${AutoLead.escapeHtml(item.notes)}</td>
            <td>${listenButton}</td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Load single lead preview by ID
   */
  async function loadLeadPreview(leadId = 0) {
    try {
      const data = await AutoLead.apiFetch(
        `../api/admin_api.php?action=lead_preview&lead_id=${encodeURIComponent(leadId)}`
      );

      if (data.all_leads && leadSelectorDropdown) {
        leadSelectorDropdown.innerHTML = data.all_leads
          .map(
            (l) =>
              `<option value="${Number(l.id)}" ${Number(l.id) === Number(data.lead.id) ? 'selected' : ''}>
                 #${Number(l.id)} - ${AutoLead.escapeHtml(l.lead_name)} (${AutoLead.escapeHtml(l.assigned_to)})
               </option>`
          )
          .join('');
      }

      renderLeadDemographics(data.lead);
      renderInteractionAuditTable(data.interactions || []);
    } catch (err) {
      AutoLead.showToast(err.message || 'Unable to load prospect audit trail.', 'danger');
    }
  }

  // Prospect dropdown switcher
  leadSelectorDropdown.addEventListener('change', () => {
    const selectedId = Number(leadSelectorDropdown.value);
    const newUrl = `${window.location.pathname}?lead_id=${selectedId}`;
    window.history.replaceState({}, '', newUrl);
    loadLeadPreview(selectedId);
  });

  // Submit Quick Interaction / Task Form
  quickInteractionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const notesInput = document.getElementById('quickInteractionNotes');
    const notes      = notesInput.value.trim();

    if (!notes) {
      AutoLead.showToast('Please enter interaction notes or task instructions.', 'danger');
      return;
    }

    AutoLead.setButtonLoading(quickLogSubmitBtn, true, 'Processing...');

    try {
      const payload = {
        action: 'log_interaction',
        lead_id: currentLeadId,
        interaction_type: quickInteractionType.value,
        call_duration: document.getElementById('quickCallDuration').value.trim() || '04:00',
        due_date: document.getElementById('quickTaskDueDate').value,
        notes
      };

      const res = await AutoLead.apiFetch('../api/admin_api.php?action=log_interaction', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      notesInput.value = '';
      AutoLead.showToast(res.message, 'success');
      await loadLeadPreview(currentLeadId);
    } catch (err) {
      AutoLead.showToast(err.message, 'danger');
    } finally {
      AutoLead.setButtonLoading(quickLogSubmitBtn, false);
    }
  });

  // ============================================================================
  // Audio Player Modal & Synchronized CSS Waveform Controller
  // ============================================================================
  function formatSeconds(sec) {
    const mins = Math.floor(sec / 60);
    const rem  = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  function parseDurationString(str) {
    if (!str || !str.includes(':')) return 240;
    const [m, s] = str.split(':').map((n) => parseInt(n, 10) || 0);
    return Math.max(15, m * 60 + s);
  }

  function updateAudioUi() {
    const pct = totalSeconds > 0 ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0;
    audioProgressFill.style.width = `${pct}%`;
    audioTimerDisplay.textContent = `${formatSeconds(elapsedSeconds)} / ${formatSeconds(totalSeconds)}`;
  }

  function stopAudioPlayback() {
    isAudioPlaying = false;
    if (audioTimer) {
      clearInterval(audioTimer);
      audioTimer = null;
    }
    waveformContainer.classList.remove('is-playing');
    audioPlayPauseBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Play Recording</span>
    `;
  }

  function startAudioPlayback() {
    isAudioPlaying = true;
    waveformContainer.classList.add('is-playing');
    audioPlayPauseBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
      <span>Pause Recording</span>
    `;

    audioTimer = setInterval(() => {
      elapsedSeconds += 1;
      if (elapsedSeconds >= totalSeconds) {
        elapsedSeconds = totalSeconds;
        updateAudioUi();
        stopAudioPlayback();
        return;
      }
      updateAudioUi();
    }, 1000);
  }

  // Listen button click handler
  interactionHistoryBody.addEventListener('click', (e) => {
    const listenBtn = e.target.closest('.js-listen-call');
    if (!listenBtn) return;

    stopAudioPlayback();
    elapsedSeconds = 0;

    const url      = listenBtn.getAttribute('data-url') || 'records/call_audit.mp3';
    const duration = listenBtn.getAttribute('data-duration') || '04:15';
    const notes    = listenBtn.getAttribute('data-notes') || '';

    totalSeconds = parseDurationString(duration);
    audioProspectName.textContent   = currentLeadName;
    audioFileUrl.textContent        = url;
    audioTranscriptText.textContent = `Audit Note: ${notes}`;

    updateAudioUi();
    AutoLead.openModal('audioPlayerModal');
    startAudioPlayback();
  });

  audioPlayPauseBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      stopAudioPlayback();
    } else {
      if (elapsedSeconds >= totalSeconds) {
        elapsedSeconds = 0;
      }
      startAudioPlayback();
    }
  });

  // Stop waveform animation when modal closes
  document.addEventListener('click', (e) => {
    if (
      e.target.closest('[data-close-modal="audioPlayerModal"]') ||
      e.target.id === 'audioPlayerModal'
    ) {
      stopAudioPlayback();
    }
  });

  // Load initial lead from URL param or default to first lead
  const params = new URLSearchParams(window.location.search);
  const initialLeadId = Number(params.get('lead_id')) || 0;
  loadLeadPreview(initialLeadId);
});