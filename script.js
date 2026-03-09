// --- Chart Loading... ---
const canvas = document.getElementById('pieChart');
const occuSelect = document.getElementById('occu');
const incomeInput = document.getElementById('income');
const taxIncomeInput = document.getElementById('tax-income');
const studentLoansInput = document.getElementById('student-loans');
const housingInput = document.getElementById('housing');
const essentialsInput = document.getElementById('essentials');
const lifestyleInput = document.getElementById('lifestyle')
const futureInput = document.getElementById('future')
const taxPopup = document.getElementById('taxPopup');
const taxInfo = document.getElementById('taxInfoButton');
const salary = document.getElementById('salary');

// Career Select
async function careerSelect() {
  const selectElement = document.getElementById('occu');
  const occupationSalaryMap = new Map();
  try {
    const response = await fetch('https://eecu-data-server.vercel.app/data');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const users = await response.json();

    users.forEach(user => {
      occupationSalaryMap.set(user["Occupation"], user["Salary"]);
      const option = new Option(user["Occupation"], user["Occupation"]);
      selectElement.add(option);
    });

    selectElement.addEventListener('change', () => {
      salary.textContent = occupationSalaryMap.get(selectElement.value) || '';
    });
  } catch (error) {
    console.error('Error populating user select:', error);
  }
}
careerSelect();


let currentChart = null;

// Helper: parse float with fallback
function toNumber(el, fallback = 0) {
  if (!el) return fallback;
  const v = parseFloat(el.value.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(v) ? v : fallback;
}

// Build chart config from current input values
function buildChartConfig() {
  const income = toNumber(incomeInput, 0);
  const taxIncome = toNumber(taxIncomeInput, income * 0.8);
  const loans = toNumber(studentLoansInput, 0);
  const housing = toNumber(housingInput, 0);
  const essentials = toNumber(essentialsInput, 0);
  const lifestyle = toNumber(lifestyleInput, 0)
  const future = toNumber(futureInput, 0)


  const labels = ['Housing', 'Essentials', 'Loans', 'Lifestyle', 'Future Proofing'];
  const data = [housing, essentials, loans, lifestyle, future];

  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Monthly (USD)',
        data,
        backgroundColor: [
          '#8979FF', '#FF928A', '#3CC3DF', '#FFAE4C', '#537FF1'
        ]
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Spending Overview (${occuSelect ? occuSelect.value : 'N/A'})` }
      }
    }
  };
}

// Initialize Chart.js chart if available
function initChart() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not found - include Chart.js to render charts.');
    return null;
  }

  const cfg = buildChartConfig();
  currentChart = new Chart(canvas, cfg);
  return currentChart;
}

// Update existing chart data in-place to keep animation smooth
function refreshChart() {
  const cfg = buildChartConfig();
  if (!currentChart) {
    currentChart = initChart();
    return;
  }

  currentChart.data.labels = cfg.data.labels;
  currentChart.data.datasets[0].data = cfg.data.datasets[0].data;
  currentChart.options.plugins = cfg.options.plugins;
  currentChart.update();
}

// Start a constant update loop every second
initChart();
setInterval(refreshChart, 500);

taxInfo.addEventListener('mouseenter', (event) => {
  taxPopup.showModal();
});

taxInfo.addEventListener('mouseleave', (event) => {
  taxPopup.close();
});