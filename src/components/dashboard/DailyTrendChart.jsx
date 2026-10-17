import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "../charts/registerCharts";
import { ChartCard } from "../charts/ChartCard";
import { axisScales, currencyTooltip } from "../charts/chartOptions";
import { useChartTheme } from "../charts/useChartTheme";

export function DailyTrendChart({ data, monthLabel, loading = false, empty = false, currency }) {
  const colors = useChartTheme();

  const chartData = useMemo(
    () => ({
      labels: data.labels,
      datasets: [
        {
          label: "Spent",
          data: data.values,
          borderColor: colors.expense,
          backgroundColor: colors.expense,
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
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
        legend: { display: false },
        tooltip: {
          ...currencyTooltip(currency),
          callbacks: {
            ...currencyTooltip(currency).callbacks,
            title(items) {
              const item = items[0];
              return item ? `Day ${item.label}` : "";
            },
          },
        },
      },
      scales: {
        ...axisScales(colors, currency),
        x: {
          ...axisScales(colors, currency).x,
          ticks: { color: colors.muted, maxTicksLimit: 10 },
        },
      },
    }),
    [colors, currency]
  );

  return (
    <ChartCard
      title="Daily spending trend"
      subtitle={monthLabel}
      loading={loading}
      empty={empty}
      emptyDescription="No expenses recorded for this month."
      height={300}
    >
      <div className="chart-canvas">
        <Line data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
