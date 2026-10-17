import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "../charts/registerCharts";
import { ChartCard } from "../charts/ChartCard";
import { doughnutTooltip } from "../charts/chartOptions";
import { useChartTheme } from "../charts/useChartTheme";

export function CategoryDoughnutChart({ data, monthLabel, loading = false, currency }) {
  const colors = useChartTheme();

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color),
          borderColor: colors.surface,
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [data, colors.surface]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: colors.muted,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            padding: 14,
            generateLabels(chart) {
              const dataset = chart.data.datasets[0] ?? { data: [] };
              const total = (dataset.data ?? []).reduce(
                (sum, item) => sum + (Number(item) || 0),
                0
              );
              return (chart.data.labels ?? []).map((label, index) => {
                const value = Number(dataset.data[index]) || 0;
                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                return {
                  text: `${label} ${percent}%`,
                  fillStyle: dataset.backgroundColor[index],
                  strokeStyle: dataset.backgroundColor[index],
                  lineWidth: 0,
                  pointStyle: "circle",
                  hidden: !chart.getDataVisibility(index),
                  index,
                };
              });
            },
          },
        },
        tooltip: doughnutTooltip(currency),
      },
    }),
    [colors, currency]
  );

  return (
    <ChartCard
      title="Spending by category"
      subtitle={monthLabel}
      loading={loading}
      empty={data.length === 0}
      emptyDescription="No expenses recorded for this month."
      height={300}
    >
      <div className="chart-canvas">
        <Doughnut data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
