/**
 * Admin Quick View Business Intelligence Controller
 * Path: C:/xampp/htdocs/autolead/js/admin/analytics.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const kpiTotalLeads        = document.getElementById('kpiTotalLeads');
  const kpiTotalConversions  = document.getElementById('kpiTotalConversions');
  const kpiConversionRate    = document.getElementById('kpiConversionRate');
  const outcomeCustomLegend  = document.getElementById('outcomeCustomLegend');
  const empNavDropdown       = document.getElementById('empNavDropdown');
  const empNavTrigger        = document.getElementById('empNavTrigger');

  let lineChartInstance     = null;
  let doughnutChartInstance = null;

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
   * Render Oct - Jun Lead Conversional Line Graph
   */
  function renderConversionLineChart(lineData) {
    const canvas = document.getElementById('conversionLineChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const tokens = AutoLead.getChartThemeTokens();

    if (lineChartInstance) {
      lineChartInstance.destroy();
    }

    lineChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: lineData.labels,
        datasets: [
          {
            label: 'Total Leads Ingested',
            data: lineData.total_leads,
            borderColor: tokens.primary,
            backgroundColor: 'rgba(29, 169, 232, 0.12)',
            borderWidth: 3,
            pointRadius: 4,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Closed Won Conversions',
            data: lineData.conversions,
            borderColor: tokens.success,
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            borderWidth: 3,
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

  /**
   * Render Outcome Distribution Doughnut Chart & Custom HTML Legend
   */
  function renderOutcomeDoughnut(doughnutData) {
    const canvas = document.getElementById('outcomeDoughnutChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const tokens = AutoLead.getChartThemeTokens();
    const colors = [tokens.success, tokens.danger, tokens.warning];

    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }

    doughnutChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: doughnutData.labels,
        datasets: [
          {
            data: doughnutData.values,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#131c31' : '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: tokens.tooltipBg,
            titleColor: tokens.tooltipText,
            bodyColor: tokens.tooltipText
          }
        }
      }
    });

    // Populate Custom HTML Legend
    const total = doughnutData.values.reduce((acc, v) => acc + Number(v), 0);
    outcomeCustomLegend.innerHTML = doughnutData.labels
      .map((label, idx) => {
        const count = Number(doughnutData.values[idx]) || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="legend-row">
            <div class="legend-label-wrap">
              <span class="legend-swatch" style="background-color: ${colors[idx]}"></span>
              <span>${AutoLead.escapeHtml(label)}</span>
            </div>
            <span class="legend-metrics">${count} (${pct}%)</span>
          </div>
        `;
      })
      .join('');
  }

  // Dynamic theme repainting via MutationObserver
  AutoLead.onThemeChange((tokens) => {
    if (lineChartInstance) {
      lineChartInstance.options.plugins.legend.labels.color = tokens.textColor;
      lineChartInstance.options.scales.x.grid.color = tokens.gridColor;
      lineChartInstance.options.scales.x.ticks.color = tokens.textColor;
      lineChartInstance.options.scales.y.grid.color = tokens.gridColor;
      lineChartInstance.options.scales.y.ticks.color = tokens.textColor;
      lineChartInstance.update();
    }
    if (doughnutChartInstance) {
      doughnutChartInstance.data.datasets[0].borderColor =
        document.documentElement.getAttribute('data-theme') === 'dark' ? '#131c31' : '#ffffff';
      doughnutChartInstance.update();
    }
  });

  async function loadAnalytics() {
    try {
      const data = await AutoLead.apiFetch('../api/admin_api.php?action=analytics');
      if (data.kpi) {
        kpiTotalLeads.textContent       = data.kpi.total_leads;
        kpiTotalConversions.textContent = data.kpi.total_conversions;
        kpiConversionRate.textContent   = `${data.kpi.conversion_rate}%`;
      }
      if (data.line_chart) {
        renderConversionLineChart(data.line_chart);
      }
      if (data.doughnut_chart) {
        renderOutcomeDoughnut(data.doughnut_chart);
      }
    } catch (err) {
      AutoLead.showToast(err.message || 'Failed to load analytics metrics.', 'danger');
    }
  }

  loadAnalytics();
});