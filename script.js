// --- Chart Loading... ---
const canvas = document.getElementById('pieChart');
const occuSelect = document.getElementById('occu');
const taxIncomeInput = document.getElementById('tax-income');
const studentLoansInput = document.getElementById('student-loans');
const housingInput = document.getElementById('housing');
const essentialsInput = document.getElementById('essentials');
const lifestyleInput = document.getElementById('lifestyle')
const futureInput = document.getElementById('future')
const taxPopup = document.getElementById('taxPopup');
const taxInfo = document.getElementById('taxInfoButton');
const salary = document.getElementById('salary');
const postTaxSalary = document.getElementById('postTaxSalary');
const income = parseFloat(salary.textContent) || 0;
const taxLabel = document.getElementById("tax")
const expensesTotal = document.getElementById('totalExpenses');


// Calculate taxes

// Add in promises or some sort of listener to grab the salary.textContent

const taxIncome = (calculateTax(income.valueOf), 0).toFixed(2);
function calculateTax(income_in) {
  const brackets = [
    { limit: 12400, rate: 0.10 },
    { limit: 50400, rate: 0.12 },
    { limit: Infinity, rate: 0.22 }
  ];

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (income_in > bracket.limit) {
      tax += (bracket.limit - previousLimit) * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      tax += (income_in - previousLimit) * bracket.rate;
      break;
    }
  }
  return tax;
}

//Updates taxes
function updateTax() {
  const income = parseFloat(salary.textContent) || 0;
  const taxValue = calculateTax(income);
  console.log(`Updated Tax: ${taxValue}`);
  taxLabel.textContent = taxValue.toFixed(2);
  const netIncome = income - taxValue;
  postTaxSalary.textContent = netIncome.toFixed(2);
}

// Listen for changes in salary to update tax info
const salaryObserver = new MutationObserver(() => {
    updateTax();
});

//Start observing the salary element for changes
salaryObserver.observe(salary, { childList: true, subtree: true });

updateTax();

// Career Select
async function careerSelect() {
  const selectElement = document.getElementById('occu');
  const occupationSalaryMap = new Map();

  try {
    const response = await fetch('https://eecu-data-server.vercel.app/data');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const users = await response.json();
    console.log(users);

    users.forEach(user => {
      occupationSalaryMap.set(user["Occupation"], user["Salary"]);
      const option = new Option(user["Occupation"], user["Occupation"]);
      selectElement.add(option);
    });

    selectElement.addEventListener('change', () => {
      const rawSalary = occupationSalaryMap.get(selectElement.value);
      salary.textContent = rawSalary ? parseFloat(rawSalary).toFixed(2) : '0.00';
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
  const taxes = parseFloat((calculateTax(parseFloat(salary.textContent) || 0) / 12).toFixed(2));
  const loans = parseFloat(toNumber(studentLoansInput, 0).toFixed(2));
  const housing = parseFloat(toNumber(housingInput, 0).toFixed(2));
  const essentials = parseFloat(toNumber(essentialsInput, 0).toFixed(2));
  const lifestyle = parseFloat(toNumber(lifestyleInput, 0).toFixed(2));
  const future = parseFloat(toNumber(futureInput, 0).toFixed(2));
  
  const totalExpenses = taxes + loans + housing + essentials + lifestyle + future;
  
  // Update the HTML div
  if (expensesTotal) {
    expensesTotal.textContent = `Total Monthly Expenses: $${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  console.log(taxes);

  const labels = ['Taxes', 'Loans', 'Housing', 'Essentials', 'Lifestyle', 'Future Proofing'];
  const data = [taxes, loans, housing, essentials, lifestyle, future];

  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Monthly ($USD)',
        data,
        backgroundColor: [
          '#8979FF', '#FF928A', '#3CC3DF', '#FFAE4C', '#537FF1', '#f153eeff'
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

taxInfo.addEventListener('click', (event) => {
  taxPopup.showModal();
});

//taxInfo.addEventListener('click', (event) => {
  //taxPopup.close();
//});