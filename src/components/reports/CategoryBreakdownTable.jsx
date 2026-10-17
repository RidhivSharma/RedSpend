import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartIcon,
  EmptyState,
} from "../ui";
import { formatCurrency } from "../../utils/format";

function ChangeCell({ row }) {
  if (row.change === null || row.change === undefined) {
    if (row.previous === 0 && row.value > 0) {
      return <span className="report-change report-change-neutral">New</span>;
    }
    return <span className="report-change report-change-neutral">—</span>;
  }

  const rounded = Math.round(row.change);
  if (rounded === 0) {
    return <span className="report-change report-change-neutral">0%</span>;
  }

  const up = rounded > 0;
  return (
    <span
      className={`report-change ${up ? "report-change-up" : "report-change-down"}`}
    >
      {up ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />}
      {Math.abs(rounded)}%
    </span>
  );
}

export function CategoryBreakdownTable({ rows = [], currency, loading = false }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Category breakdown</h2>
      </div>

      {loading ? (
        <div
          className="tx-skeleton"
          role="status"
          aria-label="Loading category breakdown"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div className="tx-skeleton-row" key={index}>
              <span className="skeleton skeleton-text tx-skeleton-main" />
              <span className="skeleton skeleton-text tx-skeleton-side" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ChartIcon size={24} />}
          title="No expenses to break down"
          description="No expense categories were recorded for this month."
          className="chart-empty"
        />
      ) : (
        <div className="table-wrap">
          <table className="table report-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col" className="tx-align-right">
                  Amount
                </th>
                <th scope="col" className="tx-align-right">
                  % of total
                </th>
                <th scope="col" className="tx-align-right">
                  vs last month
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.categoryId}>
                  <td>
                    <span className="category-badge">
                      <span
                        className="category-badge-icon"
                        style={{
                          backgroundColor: `${row.color}1f`,
                          color: row.color,
                        }}
                        aria-hidden="true"
                      >
                        {row.icon}
                      </span>
                      <span className="category-badge-name">{row.label}</span>
                    </span>
                  </td>
                  <td className="tx-align-right tx-amount">
                    {formatCurrency(row.value, currency)}
                  </td>
                  <td className="tx-align-right report-share">
                    {Math.round(row.share)}%
                  </td>
                  <td className="tx-align-right">
                    <ChangeCell row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
