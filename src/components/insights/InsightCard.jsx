import { memo } from "react";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "../ui";

const ICONS = {
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
};

export const InsightCard = memo(function InsightCard({ insight }) {
  const { type = "info", title, message } = insight;
  const Icon = ICONS[type] ?? InfoIcon;

  return (
    <article className={`insight-card insight-card-${type}`}>
      <span className="insight-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="insight-body">
        <h3 className="insight-title">{title}</h3>
        <p className="insight-message">{message}</p>
      </div>
    </article>
  );
});

export const InsightCards = memo(function InsightCards({
  insights = [],
  className = "",
}) {
  if (!Array.isArray(insights) || insights.length === 0) return null;

  return (
    <div className={`insights-row ${className}`.trim()}>
      {insights.map((insight, index) => (
        <InsightCard
          key={`${insight.type}-${index}-${insight.title}`}
          insight={insight}
        />
      ))}
    </div>
  );
});
