// --- DOM Elements ---



// --- Chart Loading ---
const canvas = document.getElementById("pieChart");
let currentChart = null;
// --- Populate dropdowns from data ---
const months = [...new Set(chartData.map(r => r.month))];
const budgets = [...new Set(chartData.map(r => r.budget))];

months.forEach(m => monthselect.add(new Option(m, m)));
budgets.forEach(h => budgetSelect.add(new Option(h, h)));

monthselect.value = months[0];
budgetSelect.value = budgets[0];

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const month = monthselect.value;
  const budget = budgetSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig("doughnut", { month, budget, metric });

  currentChart = new Chart(canvas, config);
});

function doughnutDiffCosts(month, budget) {
  const rows = getRowsForbudget(budget).filter(r => r.month === month);

  const regionSums = rows.reduce((acc, r) => {
    const region = r.region;
    const rev = r.revenue;
    acc[region] = (acc[region] || 0) + rev;
    return acc;
  }, {});

  const labels = Object.keys(regionSums);
  const data = labels.map(l => regionSums[l]);

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ label: "Revenue (USD)", data }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Revenue by region: ${budget} (${month})` }
      }
    }
  };
}