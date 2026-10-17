import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  Button,
  ChartIcon,
  DownloadIcon,
  EmptyState,
  FileTextIcon,
  PeriodNav,
  ReceiptIcon,
  useToast,
} from "../components/ui";
import { InsightCards } from "../components/insights/InsightCard";
import { CategoryBreakdownTable } from "../components/reports/CategoryBreakdownTable";
import { ComparisonChart } from "../components/reports/ComparisonChart";
import { IncomeExpenseChart } from "../components/dashboard/IncomeExpenseChart";
import { KpiCard } from "../components/dashboard/KpiCard";
import { useAuth } from "../context/authContext";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import {
  buildKpis,
  monthTotals,
  savingsRate,
  transactionsInMonth,
} from "../utils/chartData";
import {
  formatDate,
  formatMonthKey,
  monthKey,
  shiftMonthKey,
} from "../utils/dateHelpers";
import { exportMonthlyReportPDF, exportTransactionsCSV } from "../utils/export";
import { formatCurrency } from "../utils/format";
import { generateInsights } from "../utils/insights";
import {
  buildCategoryBreakdown,
  buildComparisonSeries,
  buildMonthDayStats,
  buildTopExpenses,
  buildYearlyReport,
} from "../utils/reports";

function ListSkeleton({ label, rows = 4 }) {
  return (
    <div className="tx-skeleton" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div className="tx-skeleton-row" key={index}>
          <span className="skeleton skeleton-text tx-skeleton-main" />
          <span className="skeleton skeleton-text tx-skeleton-side" />
        </div>
      ))}
    </div>
  );
}

function TopExpensesCard({ transactions, loading, currency }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Top expenses</h2>
      </div>

      {loading ? (
        <ListSkeleton label="Loading top expenses" />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="No expenses yet"
          description="No expenses were recorded for this month."
          className="chart-empty"
        />
      ) : (
        <ul className="recent-list">
          {transactions.map((transaction, index) => (
            <li key={transaction.id} className="recent-item top-expense-item">
              <span className="report-rank" aria-hidden="true">
                {index + 1}
              </span>
              <span className="recent-item-main">
                <span className="recent-item-category">
                  {transaction.categoryName || "Uncategorized"}
                </span>
                <span className="recent-item-date">
                  {formatDate(transaction.date)}
                </span>
              </span>
              <span className="tx-amount text-expense">
                −{formatCurrency(transaction.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DayStatsCard({ stats, loading, currency }) {
  const hasSpending = Boolean(stats.highestDay);

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Daily spending</h2>
      </div>

      {loading ? (
        <ListSkeleton label="Loading daily spending" rows={2} />
      ) : (
        <div className="report-stats">
          <div className="report-stat">
            <span className="budget-stat-label">Highest spending day</span>
            <span className="report-stat-value">
              {hasSpending
                ? formatCurrency(stats.highestDay.amount, currency)
                : "—"}
            </span>
            <span className="report-stat-caption">
              {hasSpending
                ? formatDate(stats.highestDay.date)
                : "No spending this month"}
            </span>
          </div>
          <div className="report-stat">
            <span className="budget-stat-label">Average daily spend</span>
            <span className="report-stat-value">
              {formatCurrency(stats.averageDaily, currency)}
            </span>
            <span className="report-stat-caption">
              {stats.elapsedDays > 0
                ? `Based on the first ${stats.elapsedDays} ${
                    stats.elapsedDays === 1 ? "day" : "days"
                  } of the month`
                : "This month has not started yet"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function YearlyTable({ report, loading, currency }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Month by month</h2>
      </div>

      {loading ? (
        <ListSkeleton label="Loading monthly totals" rows={6} />
      ) : (
        <div className="table-wrap">
          <table className="table report-table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="tx-align-right">
                  Income
                </th>
                <th scope="col" className="tx-align-right">
                  Expenses
                </th>
                <th scope="col" className="tx-align-right">
                  Net
                </th>
                <th scope="col" className="tx-align-right">
                  Savings rate
                </th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row) => (
                <tr key={row.month}>
                  <td>{row.label}</td>
                  <td className="tx-align-right tx-amount">
                    {formatCurrency(row.income, currency)}
                  </td>
                  <td className="tx-align-right tx-amount">
                    {formatCurrency(row.expense, currency)}
                  </td>
                  <td
                    className={`tx-align-right tx-amount ${
                      row.net < 0 ? "text-expense" : "text-income"
                    }`}
                  >
                    {formatCurrency(row.net, currency)}
                  </td>
                  <td className="tx-align-right report-share">
                    {row.savingsRate === null ? "—" : `${row.savingsRate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="tx-align-right tx-amount">
                  {formatCurrency(report.totals.income, currency)}
                </td>
                <td className="tx-align-right tx-amount">
                  {formatCurrency(report.totals.expense, currency)}
                </td>
                <td
                  className={`tx-align-right tx-amount ${
                    report.totals.net < 0 ? "text-expense" : "text-income"
                  }`}
                >
                  {formatCurrency(report.totals.net, currency)}
                </td>
                <td className="tx-align-right report-share">
                  {report.totals.savingsRate === null
                    ? "—"
                    : `${report.totals.savingsRate}%`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ReportsPage() {
  const { profile } = useAuth();
  const currency = profile?.currency || "INR";
  const toast = useToast();

  const [view, setView] = useState("monthly");
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [exportingPdf, setExportingPdf] = useState(false);

  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  } = useCategories();
  const {
    data: budgets,
    loading: budgetsLoading,
    error: budgetsError,
    refresh: refreshBudgets,
  } = useBudgets(month);

  const loading = transactionsLoading || categoriesLoading || budgetsLoading;
  const error = transactionsError || categoriesError || budgetsError;

  const categoriesById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const kpis = useMemo(() => buildKpis(transactions, month), [transactions, month]);
  const insights = useMemo(
    () => generateInsights(transactions, budgets, month, currency),
    [transactions, budgets, month, currency]
  );
  const breakdown = useMemo(
    () => buildCategoryBreakdown(transactions, month, categoriesById),
    [transactions, month, categoriesById]
  );
  const comparison = useMemo(
    () => buildComparisonSeries(transactions, month, categoriesById, 8),
    [transactions, month, categoriesById]
  );
  const topExpenses = useMemo(
    () => buildTopExpenses(transactions, month, 5),
    [transactions, month]
  );
  const dayStats = useMemo(
    () => buildMonthDayStats(transactions, month),
    [transactions, month]
  );
  const monthTransactions = useMemo(
    () => transactionsInMonth(transactions, month),
    [transactions, month]
  );
  const yearly = useMemo(
    () => buildYearlyReport(transactions, year),
    [transactions, year]
  );
  const summaryTotals = useMemo(
    () => monthTotals(transactions, month),
    [transactions, month]
  );
  const summaryRate = useMemo(
    () => savingsRate(summaryTotals.income, summaryTotals.expense),
    [summaryTotals]
  );

  const hasMonthData = monthTransactions.length > 0;
  const hasYearData = yearly.totals.income + yearly.totals.expense > 0;
  const isCurrentMonthKey = month === monthKey(new Date());
  const currentYear = new Date().getFullYear();

  const handleRetry = () => {
    if (transactionsError) refreshTransactions();
    if (categoriesError) refreshCategories();
    if (budgetsError) refreshBudgets();
  };

  const handleExportCSV = () => {
    try {
      exportTransactionsCSV(monthTransactions, `spendwise-report-${month}.csv`);
      toast.success(`Exported ${monthTransactions.length} transactions.`);
    } catch (exportError) {
      console.error("[SpendWise] Failed to export CSV:", exportError);
      toast.error("Could not export the report. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    setExportingPdf(true);
    try {
      await exportMonthlyReportPDF(
        {
          summary: {
            income: summaryTotals.income,
            expense: summaryTotals.expense,
            net: summaryTotals.balance,
            savingsRate: summaryRate,
          },
          categories: breakdown,
          transactions: monthTransactions,
        },
        month,
        currency
      );
      toast.success("Report downloaded.");
    } catch (pdfError) {
      console.error("[SpendWise] Failed to create the PDF:", pdfError);
      toast.error("Could not create the PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const errorCard = (
    <div className="card">
      <EmptyState
        icon={<AlertTriangleIcon size={24} />}
        title="Something went wrong"
        description={error}
        action={
          <Button variant="secondary" onClick={handleRetry}>
            Try again
          </Button>
        }
      />
    </div>
  );

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Monthly summaries and yearly trends at a glance.
          </p>
        </div>
        <div className="report-controls">
          <div className="type-toggle" role="group" aria-label="Report view">
            <button
              type="button"
              className={`type-toggle-option${view === "monthly" ? " active" : ""}`}
              aria-pressed={view === "monthly"}
              onClick={() => setView("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`type-toggle-option${view === "yearly" ? " active" : ""}`}
              aria-pressed={view === "yearly"}
              onClick={() => setView("yearly")}
            >
              Yearly
            </button>
          </div>
          {view === "monthly" ? (
            <PeriodNav
              label={formatMonthKey(month)}
              onPrevious={() => setMonth((current) => shiftMonthKey(current, -1))}
              onNext={() => setMonth((current) => shiftMonthKey(current, 1))}
              onReset={
                isCurrentMonthKey ? null : () => setMonth(monthKey(new Date()))
              }
              resetLabel="This month"
            />
          ) : (
            <PeriodNav
              label={String(year)}
              onPrevious={() => setYear((current) => current - 1)}
              onNext={() => setYear((current) => current + 1)}
              onReset={year === currentYear ? null : () => setYear(currentYear)}
              resetLabel="This year"
              previousLabel="Previous year"
              nextLabel="Next year"
            />
          )}
        </div>
      </div>

      {error ? (
        errorCard
      ) : view === "monthly" ? (
        <>
          <div className="report-export-bar">
            <p className="report-export-label">
              Export {formatMonthKey(month)}
            </p>
            <div className="report-export-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={loading || !hasMonthData || exportingPdf}
                loading={exportingPdf}
              >
                <FileTextIcon size={16} />
                Download PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                disabled={loading || !hasMonthData}
              >
                <DownloadIcon size={16} />
                Export CSV
              </Button>
            </div>
          </div>

          {!loading && hasMonthData ? <InsightCards insights={insights} /> : null}

          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                currency={currency}
                loading={loading}
              />
            ))}
          </div>

          {!loading && !hasMonthData ? (
            <div className="card">
              <EmptyState
                icon={<ReceiptIcon size={24} />}
                title={`No data for ${formatMonthKey(month)}`}
                description="Add income or expenses for this month to see the full report."
              />
            </div>
          ) : (
            <>
              <div className="content-grid">
                <ComparisonChart
                  data={comparison}
                  monthLabel={formatMonthKey(month)}
                  loading={loading}
                  currency={currency}
                />
                <CategoryBreakdownTable
                  rows={breakdown}
                  currency={currency}
                  loading={loading}
                />
              </div>
              <div className="content-grid">
                <TopExpensesCard
                  transactions={topExpenses}
                  loading={loading}
                  currency={currency}
                />
                <DayStatsCard
                  stats={dayStats}
                  loading={loading}
                  currency={currency}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="content-stack">
          {!loading && !hasYearData ? (
            <div className="card">
              <EmptyState
                icon={<ChartIcon size={24} />}
                title={`No data for ${year}`}
                description="No transactions were recorded this year."
              />
            </div>
          ) : (
            <>
              <IncomeExpenseChart
                data={yearly.series}
                subtitle={`All 12 months of ${year}`}
                loading={loading}
                currency={currency}
              />
              <YearlyTable report={yearly} loading={loading} currency={currency} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
