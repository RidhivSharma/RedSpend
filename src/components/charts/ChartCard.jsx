import { ChartIcon, EmptyState } from "../ui";

export function ChartCard({
  title,
  subtitle,
  loading = false,
  empty = false,
  emptyTitle = "No data yet",
  emptyDescription,
  height = 280,
  children,
}) {
  return (
    <section className="card chart-card">
      <div className="chart-card-head">
        <div>
          <h2 className="card-title">{title}</h2>
          {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-card-body" style={{ "--chart-height": `${height}px` }}>
        {loading ? (
          <div
            className="skeleton chart-skeleton"
            role="status"
            aria-label={`Loading ${title}`}
          />
        ) : empty ? (
          <EmptyState
            icon={<ChartIcon size={24} />}
            title={emptyTitle}
            description={emptyDescription}
            className="chart-empty"
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
