import { formatCompactCurrency, formatCurrency } from "../../utils/format";

export function currencyTooltip(currency) {
  return {
    callbacks: {
      label(context) {
        const raw = context.parsed?.y ?? context.parsed;
        const value = Number(raw) || 0;
        const prefix = context.dataset?.label ? `${context.dataset.label}: ` : "";
        return `${prefix}${formatCurrency(value, currency)}`;
      },
    },
  };
}

export function doughnutTooltip(currency) {
  return {
    callbacks: {
      label(context) {
        const data = context.dataset?.data ?? [];
        const total = data.reduce((sum, item) => sum + (Number(item) || 0), 0);
        const value = Number(context.parsed) || 0;
        const percent = total > 0 ? (value / total) * 100 : 0;
        return `${context.label}: ${formatCurrency(value, currency)} (${percent.toFixed(1)}%)`;
      },
    },
  };
}

export function axisScales(colors, currency) {
  return {
    x: {
      grid: { display: false },
      border: { color: colors.grid },
      ticks: { color: colors.muted },
    },
    y: {
      beginAtZero: true,
      grid: { color: colors.grid },
      border: { display: false },
      ticks: {
        color: colors.muted,
        callback: (value) => formatCompactCurrency(value, currency),
      },
    },
  };
}

export function legendOptions(colors) {
  return {
    position: "bottom",
    labels: {
      color: colors.muted,
      usePointStyle: true,
      pointStyle: "circle",
      boxWidth: 8,
      padding: 16,
    },
  };
}
