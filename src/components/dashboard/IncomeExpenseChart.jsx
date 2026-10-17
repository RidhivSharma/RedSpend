import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "../charts/registerCharts";
import { ChartCard } from "../charts/ChartCard";
import { axisScales, currencyTooltip, legendOptions } from "../charts/chartOptions";
import { useChartTheme } from "../charts/useChartTheme";

export function IncomeExpenseChart({
  data,
  subtitle = "Last 6 months",
  loading = false,
  currency,
}) {
  const colors = useChartTheme();

  const empty =
    data.income.every((value) => value === 0) &&
    data.expense.every((value) => value === 0);

  const chartData = useMemo(
    () => ({
      labels: data.labels,
      datasets: [
        {
          label: "Income",
          data: data.income,
          backgroundColor: colors.income,
          borderRadius: 4,
          maxBarThickness: 26,
        },
        {
          label: "Expense",
          data: data.expense,
          backgroundColor: colors.expense,
          borderRadius: 4,
          maxBarThickness: 26,
        },
      ],
    }),
    [data, colors]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: legendOptions(colors),
        tooltip: currencyTooltip(currency),
      },
      scales: axisScales(colors, currency),
    }),
    [colors, currency]
  );

  return (
    <ChartCard
      title="Income vs expense"
      subtitle={subtitle}
      loading={loading}
      empty={empty}
      emptyDescription="Add income or expenses to see this chart."
      height={280}
    >
      <div className="chart-canvas">
        <Bar data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
