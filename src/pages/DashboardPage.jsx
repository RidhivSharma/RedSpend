import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangleIcon,
  Button,
  EmptyState,
  PeriodNav,
  ProgressBar,
  ReceiptIcon,
  TargetIcon,
} from "../components/ui";
import { BalanceTrendChart } from "../components/dashboard/BalanceTrendChart";
import { CategoryDoughnutChart } from "../components/dashboard/CategoryDoughnutChart";
import { DailyTrendChart } from "../components/dashboard/DailyTrendChart";
import { IncomeExpenseChart } from "../components/dashboard/IncomeExpenseChart";
import { KpiCard } from "../components/dashboard/KpiCard";
import { InsightCards } from "../components/insights/InsightCard";
import { useAuth } from "../context/authContext";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import {
  buildBalanceSeries,
  buildBudgetHighlights,
  buildCategorySpending,
  buildDailySpending,
  buildKpis,
  buildMonthlySeries,
  buildRecentTransactions,
  transactionsInMonth,
} from "../utils/chartData";
import {
  formatDate,
  formatMonthKey,
  monthKey,
  shiftMonthKey,
} from "../utils/dateHelpers";
import { formatCurrency } from "../utils/format";
import { generateInsights } from "../utils/insights";

function RecentTransactionsCard({ transactions, loading, currency }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Recent transactions</h2>
        <Link to="/transactions" className="card-link">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="tx-skeleton" role="status" aria-label="Loading recent transactions">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="tx-skeleton-row" key={index}>
              <span className="skeleton skeleton-text tx-skeleton-main" />
              <span className="skeleton skeleton-text tx-skeleton-side" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="No transactions yet"
          description="Add your first income or expense to see it here."
          className="chart-empty"
        />
      ) : (
        <ul className="recent-list">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            return (
              <li key={transaction.id} className="recent-item">
                <span className="recent-item-main">
                  <span className="recent-item-category">
                    {transaction.categoryName || "Uncategorized"}
                  </span>
                  <span className="recent-item-date">
                    {formatDate(transaction.date)}
                  </span>
                </span>
                <span
                  className={`tx-amount ${isIncome ? "text-income" : "text-expense"}`}
                >
                  {isIncome ? "+" : "−"}
                  {formatCurrency(transaction.amount, currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function BudgetStatusCard({
  highlights,
  hasBudgets,
  loading,
  error,
  onRetry,
  monthLabel,
  currency,
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Budget status</h2>
        <Link to="/budgets" className="card-link">
          Manage
        </Link>
      </div>

      {loading ? (
        <div className="tx-skeleton" role="status" aria-label="Loading budget status">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="tx-skeleton-row" key={index}>
              <span className="skeleton skeleton-text tx-skeleton-main" />
              <span className="skeleton skeleton-text tx-skeleton-side" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangleIcon size={24} />}
          title="Could not load budgets"
          description={error}
          className="chart-empty"
          action={
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      ) : !hasBudgets ? (
        <EmptyState
          icon={<TargetIcon size={24} />}
          title="No budgets set"
          description={`Set budgets for ${monthLabel} to track your limits.`}
          className="chart-empty"
          action={
            <Link to="/budgets" className="btn btn-secondary btn-sm">
              Set budgets
            </Link>
          }
        />
      ) : (
        <ul className="budget-status-list">
          {highlights.map((item) => (
            <li key={item.categoryId} className="budget-status-item">
              <div className="budget-status-info">
                <span className="budget-status-name">{item.categoryName}</span>
                <span className="budget-status-meta">
                  {formatCurrency(item.spent, currency)} of{" "}
                  {formatCurrency(item.limit, currency)} · {item.percent}%
                </span>
              </div>
              <ProgressBar
                value={item.spent}
                max={item.limit}
                tone={item.tone}
                label={`${item.categoryName} budget usage`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const currency = profile?.currency || "INR";

  const [month, setMonth] = useState(() => monthKey(new Date()));

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

  const loading = transactionsLoading || categoriesLoading;
  const error = transactionsError || categoriesError;

  const monthKeys = useMemo(() => {
    const keys = [];
    for (let index = 5; index >= 0; index -= 1) {
      keys.push(shiftMonthKey(month, -index));
    }
    return keys;
  }, [month]);

  const categoriesById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const monthly = useMemo(
    () => buildMonthlySeries(transactions, monthKeys),
    [transactions, monthKeys]
  );
  const balanceSeries = useMemo(
    () => buildBalanceSeries(transactions, monthKeys),
    [transactions, monthKeys]
  );
  const monthTransactions = useMemo(
    () => transactionsInMonth(transactions, month),
    [transactions, month]
  );
  const categorySpending = useMemo(
    () => buildCategorySpending(monthTransactions, categoriesById),
    [monthTransactions, categoriesById]
  );
  const daily = useMemo(
    () => buildDailySpending(transactions, month),
    [transactions, month]
  );
  const kpis = useMemo(() => buildKpis(transactions, month), [transactions, month]);
  const recent = useMemo(() => buildRecentTransactions(transactions, 5), [transactions]);
  const budgetHighlights = useMemo(
    () => buildBudgetHighlights(budgets, transactions, month, 3),
    [budgets, transactions, month]
  );
  const insights = useMemo(
    () => generateInsights(transactions, budgets, month, currency).slice(0, 3),
    [transactions, budgets, month, currency]
  );

  const hasSixMonthActivity =
    monthly.income.some((value) => value > 0) ||
    monthly.expense.some((value) => value > 0);
  const dailyHasData = daily.values.some((value) => value > 0);

  const handleRetry = () => {
    if (transactionsError) refreshTransactions();
    if (categoriesError) refreshCategories();
  };

  const isCurrentMonth = month === monthKey(new Date());

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Track how your money moves, month by month.
          </p>
        </div>
        <PeriodNav
          label={formatMonthKey(month)}
          onPrevious={() => setMonth((current) => shiftMonthKey(current, -1))}
          onNext={() => setMonth((current) => shiftMonthKey(current, 1))}
          onReset={isCurrentMonth ? null : () => setMonth(monthKey(new Date()))}
          resetLabel="This month"
        />
      </div>

      {error ? (
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
      ) : (
        <>
          {!loading ? <InsightCards insights={insights} /> : null}

          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} currency={currency} loading={loading} />
            ))}
          </div>

          <div className="dashboard-grid">
            <IncomeExpenseChart
              data={monthly}
              loading={loading}
              currency={currency}
            />
            <BalanceTrendChart
              data={balanceSeries}
              loading={loading}
              empty={!hasSixMonthActivity}
              currency={currency}
            />
            <CategoryDoughnutChart
              data={categorySpending}
              monthLabel={formatMonthKey(month)}
              loading={loading}
              currency={currency}
            />
            <DailyTrendChart
              data={daily}
              monthLabel={formatMonthKey(month)}
              loading={loading}
              empty={!dailyHasData}
              currency={currency}
            />
          </div>

          <div className="dashboard-grid">
            <RecentTransactionsCard
              transactions={recent}
              loading={loading}
              currency={currency}
            />
            <BudgetStatusCard
              highlights={budgetHighlights}
              hasBudgets={budgets.length > 0}
              loading={budgetsLoading}
              error={budgetsError}
              onRetry={refreshBudgets}
              monthLabel={formatMonthKey(month)}
              currency={currency}
            />
          </div>
        </>
      )}
    </section>
  );
}
