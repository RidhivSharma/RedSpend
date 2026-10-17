import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "../charts/registerCharts";
import { ChartCard } from "../charts/ChartCard";
import {
  axisScales,
  currencyTooltip,
  legendOptions,
} from "../charts/chartOptions";
import { useChartTheme } from "../charts/useChartTheme";

export function ComparisonChart({ data, monthLabel, loading = false, currency }) {
  const colors = useChartTheme();
  const { labels, current, previous } = data;

  const empty =
    current.every((value) => value === 0) && previous.every((value) => value === 0);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "This month",
          data: current,
          backgroundColor: colors.primary,
          borderRadius: 4,
          maxBarThickness: 22,
        },
        {
          label: "Last month",
          data: previous,
          backgroundColor: colors.muted,
          borderRadius: 4,
          maxBarThickness: 22,
        },
      ],
    }),
    [labels, current, previous, colors]
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
      title="This month vs last month"
      subtitle={`By category · ${monthLabel}`}
      loading={loading}
      empty={empty}
      emptyDescription="No expenses recorded for this month or last month."
      height={320}
    >
      <div className="chart-canvas">
        <Bar data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
