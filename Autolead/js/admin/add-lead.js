/**
 * Admin Add Lead Ingestion Controller
 * Path: C:/xampp/htdocs/autolead/js/admin/add-lead.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const addLeadForm      = document.getElementById('addLeadForm');
  const submitLeadBtn    = document.getElementById('submitLeadBtn');
  const addLeadFeedback  = document.getElementById('addLeadFeedback');
  const leadAssignSelect = document.getElementById('leadAssignSelect');
  const empNavDropdown   = document.getElementById('empNavDropdown');
  const empNavTrigger    = document.getElementById('empNavTrigger');

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

  // Populate employee assignment options dynamically from database
  async function loadEmployees() {
    try {
      const data = await AutoLead.apiFetch('../api/admin_api.php?action=employees');
      if (data.employees && data.employees.length > 0) {
        leadAssignSelect.innerHTML = data.employees
          .map(
            (emp) =>
              `<option value="${AutoLead.escapeHtml(emp.employee_code)}">
                 ${AutoLead.escapeHtml(emp.employee_code)} - ${AutoLead.escapeHtml(emp.full_name)}
               </option>`
          )
          .join('');
      }
    } catch (err) {
      // Fallback options are already present in HTML
    }
  }

  loadEmployees();

  function clearValidationErrors() {
    document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    document.querySelectorAll('.input-invalid').forEach((el) => el.classList.remove('input-invalid'));
    addLeadFeedback.className = 'form-feedback-banner';
    addLeadFeedback.textContent = '';
  }

  function setFieldError(inputId, errorId, message) {
    const inputEl = document.getElementById(inputId);
    const errEl   = document.getElementById(errorId);
    if (inputEl) inputEl.classList.add('input-invalid');
    if (errEl) errEl.textContent = message;
  }

  addLeadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidationErrors();

    const leadName   = document.getElementById('leadNameInput').value.trim();
    const email      = document.getElementById('leadEmailInput').value.trim();
    const phone      = document.getElementById('leadPhoneInput').value.trim();
    const age        = parseInt(document.getElementById('leadAgeInput').value, 10);
    const gender     = document.getElementById('leadGenderSelect').value;
    const source     = document.getElementById('leadSourceSelect').value;
    const assignedTo = document.getElementById('leadAssignSelect').value;
    const leadScore  = parseInt(document.getElementById('leadScoreInput').value, 10) || 75;

    let isValid = true;

    if (leadName.length < 2) {
      setFieldError('leadNameInput', 'errLeadName', 'Please enter the full name of the lead.');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldError('leadEmailInput', 'errLeadEmail', 'Please enter a valid email address.');
      isValid = false;
    }

    if (phone.length < 7) {
      setFieldError('leadPhoneInput', 'errLeadPhone', 'Please enter a valid contact phone number.');
      isValid = false;
    }

    if (Number.isNaN(age) || age < 18 || age > 100) {
      setFieldError('leadAgeInput', 'errLeadAge', 'Age must be between 18 and 100.');
      isValid = false;
    }

    if (!gender) {
      setFieldError('leadGenderSelect', 'errLeadGender', 'Please select a gender.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    AutoLead.setButtonLoading(submitLeadBtn, true, 'Processing...');

    try {
      const res = await AutoLead.apiFetch('../api/admin_api.php?action=add_lead', {
        method: 'POST',
        body: JSON.stringify({
          action: 'add_lead',
          lead_name: leadName,
          email,
          phone,
          age,
          gender,
          source,
          assigned_to: assignedTo,
          lead_score: leadScore
        })
      });

      addLeadFeedback.textContent = res.message;
      addLeadFeedback.className   = 'form-feedback-banner visible banner-success';
      AutoLead.showToast(res.message, 'success');
      addLeadForm.reset();
      document.getElementById('leadScoreInput').value = '78';
    } catch (err) {
      addLeadFeedback.textContent = err.message || 'Failed to ingest lead.';
      addLeadFeedback.className   = 'form-feedback-banner visible banner-error';
      AutoLead.showToast(err.message, 'danger');
    } finally {
      AutoLead.setButtonLoading(submitLeadBtn, false);
    }
  });
});