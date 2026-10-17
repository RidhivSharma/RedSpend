import { memo } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../ui";
import { formatCurrency } from "../../utils/format";

export const KpiCard = memo(function KpiCard({ kpi, currency, loading = false }) {
  const { id, label, value, valueType, change, changeType, positiveIsGood } = kpi;

  const formattedValue =
    valueType === "percent"
      ? value === null
        ? "—"
        : `${value.toFixed(1)}%`
      : formatCurrency(value, currency);

  const valueTone =
    id === "balance" ? (Number(value) < 0 ? "text-expense" : "text-income") : "";

  const hasChange = change !== null && change !== undefined;
  let trend = "flat";
  if (hasChange && change > 0) trend = "up";
  if (hasChange && change < 0) trend = "down";

  const isGood = trend === "flat" ? true : (trend === "up") === positiveIsGood;
  const changeLabel = hasChange
    ? `${Math.abs(change).toFixed(1)}${changeType === "points" ? " pts" : "%"}`
    : "";

  const trendClass = !hasChange || trend === "flat"
    ? "kpi-trend-muted"
    : isGood
      ? "kpi-trend-good"
      : "kpi-trend-bad";

  return (
    <div className="card kpi-card">
      <span className="kpi-label">{label}</span>
      {loading ? (
        <span className="skeleton kpi-skeleton" aria-hidden="true" />
      ) : (
        <span className={`kpi-value ${valueTone}`.trim()}>{formattedValue}</span>
      )}
      {loading ? (
        <span className="skeleton kpi-trend-skeleton" aria-hidden="true" />
      ) : (
        <span className={`kpi-trend ${trendClass}`}>
          {trend === "up" ? <ArrowUpIcon size={14} /> : null}
          {trend === "down" ? <ArrowDownIcon size={14} /> : null}
          {hasChange ? changeLabel : "No previous data"}
          {hasChange ? <span className="kpi-trend-caption">vs last month</span> : null}
        </span>
      )}
    </div>
  );
});
