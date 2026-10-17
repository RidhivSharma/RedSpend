import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "../charts/registerCharts";
import { ChartCard } from "../charts/ChartCard";
import { axisScales, currencyTooltip, legendOptions } from "../charts/chartOptions";
import { useChartTheme } from "../charts/useChartTheme";

export function BalanceTrendChart({ data, loading = false, empty = false, currency }) {
  const colors = useChartTheme();

  const chartData = useMemo(
    () => ({
      labels: data.labels,
      datasets: [
        {
          label: "Balance",
          data: data.values,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}2b`,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.surface,
          pointBorderWidth: 1.5,
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
        legend: { ...legendOptions(colors), display: false },
        tooltip: currencyTooltip(currency),
      },
      scales: axisScales(colors, currency),
    }),
    [colors, currency]
  );

  return (
    <ChartCard
      title="Balance over time"
      subtitle="Cumulative net balance, last 6 months"
      loading={loading}
      empty={empty}
      emptyDescription="Add income or expenses to see your balance trend."
      height={280}
    >
      <div className="chart-canvas">
        <Line data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
