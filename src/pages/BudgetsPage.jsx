import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  ConfirmDialog,
  CopyIcon,
  EmptyState,
  ProgressBar,
  TargetIcon,
  useToast,
} from "../components/ui";
import { BudgetRow } from "../components/budgets/BudgetRow";
import { useAuth } from "../context/authContext";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import {
  deleteBudget,
  getBudgetsByMonth,
  setBudget,
} from "../services/budgetService";
import { groupByCategory } from "../utils/calc";
import {
  formatMonthKey,
  monthKey,
  shiftMonthKey,
  toDate,
} from "../utils/dateHelpers";
import { formatCurrency } from "../utils/format";

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

export default function BudgetsPage() {
  const { user, profile } = useAuth();
  const uid = user?.uid;
  const currency = profile?.currency || "INR";
  const toast = useToast();

  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  const {
    data: budgets,
    loading: budgetsLoading,
    error: budgetsError,
    refresh: refreshBudgets,
  } = useBudgets(month);
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  } = useCategories();
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions();

  const loading = budgetsLoading || categoriesLoading || transactionsLoading;
  const error = budgetsError || categoriesError || transactionsError;

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  );

  const budgetsByCategory = useMemo(() => {
    const map = {};
    budgets.forEach((budget) => {
      map[budget.categoryId] = budget;
    });
    return map;
  }, [budgets]);

  const spentByCategory = useMemo(() => {
    const monthExpenses = transactions.filter((transaction) => {
      if (!transaction || transaction.type !== "expense") return false;
      const date = toDate(transaction.date);
      return Boolean(date) && monthKey(date) === month;
    });
    return groupByCategory(monthExpenses);
  }, [transactions, month]);

  const rows = useMemo(() => {
    const known = new Set(expenseCategories.map((category) => category.id));
    const orphanBudgets = budgets.filter(
      (budget) => !known.has(budget.categoryId)
    );
    return [
      ...expenseCategories.map((category) => ({
        category,
        budget: budgetsByCategory[category.id] ?? null,
      })),
      ...orphanBudgets.map((budget) => ({
        category: {
          id: budget.categoryId,
          name: budget.categoryName,
          icon: "🏷️",
          color: "#64748b",
        },
        budget,
      })),
    ];
  }, [expenseCategories, budgets, budgetsByCategory]);

  const summary = useMemo(() => {
    let limit = 0;
    let spent = 0;
    budgets.forEach((budget) => {
      limit += Number(budget.limit) || 0;
      spent += spentByCategory[budget.categoryId]?.total ?? 0;
    });
    return {
      limit: roundMoney(limit),
      spent: roundMoney(spent),
      remaining: roundMoney(limit - spent),
    };
  }, [budgets, spentByCategory]);

  const summaryTone =
    summary.limit > 0 && summary.spent > summary.limit
      ? "danger"
      : summary.limit > 0 && summary.spent / summary.limit >= 0.8
        ? "warning"
        : "primary";

  const isCurrentMonth = month === monthKey(new Date());
  const hasBudgets = budgets.length > 0;

  const handleSaveLimit = async (category, limit) => {
    if (!uid) {
      throw new Error("You need to be signed in.");
    }
    await setBudget(uid, {
      month,
      categoryId: category.id,
      categoryName: category.name,
      limit,
    });
    toast.success(`Budget saved for ${category.name}.`);
  };

  const handleDeleteBudget = async () => {
    if (!deletingBudget || !uid) return;
    setDeleteLoading(true);
    try {
      await deleteBudget(uid, month, deletingBudget.category.id);
      setDeletingBudget(null);
      toast.success("Budget removed.");
    } catch (deleteError) {
      console.error("[SpendWise] Failed to delete budget:", deleteError);
      toast.error(
        deleteError?.code
          ? "Could not remove the budget. Check your connection and try again."
          : deleteError?.message || "Could not remove the budget."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyLastMonth = async () => {
    if (!uid) return;
    const previousMonth = shiftMonthKey(month, -1);
    setCopying(true);
    try {
      const previousBudgets = await getBudgetsByMonth(uid, previousMonth);
      if (previousBudgets.length === 0) {
        toast.info(`No budgets found for ${formatMonthKey(previousMonth)}.`);
        return;
      }
      await Promise.all(
        previousBudgets.map((budget) =>
          setBudget(uid, {
            month,
            categoryId: budget.categoryId,
            categoryName: budget.categoryName,
            limit: budget.limit,
          })
        )
      );
      toast.success(
        `Copied ${previousBudgets.length} budget${
          previousBudgets.length === 1 ? "" : "s"
        } from ${formatMonthKey(previousMonth)}.`
      );
    } catch (copyError) {
      console.error("[SpendWise] Failed to copy budgets:", copyError);
      toast.error(
        copyError?.code
          ? "Could not copy budgets. Check your connection and try again."
          : copyError?.message || "Could not copy budgets."
      );
    } finally {
      setCopying(false);
    }
  };

  const handleRetry = () => {
    if (budgetsError) refreshBudgets();
    if (categoriesError) refreshCategories();
    if (transactionsError) refreshTransactions();
  };

  const summaryBadge = () => {
    if (summary.limit <= 0) return null;
    if (summary.spent > summary.limit) {
      return <span className="badge badge-expense">Over budget</span>;
    }
    if (summary.spent / summary.limit >= 0.8) {
      return <span className="badge badge-warning">Close to limit</span>;
    }
    return <span className="badge badge-income">On track</span>;
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">
            Set monthly limits and track how much is left.
          </p>
        </div>
        <div className="month-nav" role="group" aria-label="Select month">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMonth((current) => shiftMonthKey(current, -1))}
            aria-label="Previous month"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <span className="month-nav-label">{formatMonthKey(month)}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMonth((current) => shiftMonthKey(current, 1))}
            aria-label="Next month"
          >
            <ChevronRightIcon size={18} />
          </button>
          {isCurrentMonth ? null : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonth(monthKey(new Date()))}
            >
              This month
            </Button>
          )}
        </div>
      </div>

      {!loading && !error ? (
        <div className="card budget-summary">
          <div className="budget-summary-head">
            <div>
              <h2 className="card-title">Total budget</h2>
              <p className="card-subtitle">
                {formatMonthKey(month)} · {budgets.length}{" "}
                {budgets.length === 1 ? "category" : "categories"} with a budget
              </p>
            </div>
            {summaryBadge()}
          </div>
          <div className="budget-summary-grid">
            <div>
              <span className="budget-stat-label">Budget</span>
              <span className="budget-stat-value">
                {formatCurrency(summary.limit, currency)}
              </span>
            </div>
            <div>
              <span className="budget-stat-label">Spent</span>
              <span className="budget-stat-value text-expense">
                {formatCurrency(summary.spent, currency)}
              </span>
            </div>
            <div>
              <span className="budget-stat-label">Remaining</span>
              <span
                className={`budget-stat-value${
                  summary.remaining < 0 ? " text-expense" : " text-income"
                }`}
              >
                {formatCurrency(summary.remaining, currency)}
              </span>
            </div>
          </div>
          {summary.limit > 0 ? (
            <ProgressBar
              value={summary.spent}
              max={summary.limit}
              tone={summaryTone}
              label="Overall budget usage"
            />
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="card tx-list-card">
          <div
            className="tx-skeleton"
            role="status"
            aria-label="Loading budgets"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <div className="tx-skeleton-row" key={index}>
                <span className="skeleton skeleton-circle tx-skeleton-dot" />
                <span className="skeleton skeleton-text tx-skeleton-main" />
                <span className="skeleton skeleton-text tx-skeleton-side" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
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
      ) : !hasBudgets && !showAllCategories ? (
        <div className="card">
          <EmptyState
            icon={<TargetIcon size={24} />}
            title={`No budgets for ${formatMonthKey(month)}`}
            description="Set a monthly limit per category to track your spending, or copy last month's budgets."
            action={
              <div className="empty-actions">
                <Button onClick={handleCopyLastMonth} loading={copying}>
                  <CopyIcon size={16} />
                  Copy last month&apos;s budgets
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAllCategories(true)}
                >
                  Set budgets manually
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="card tx-list-card">
          <div className="tx-list-header">
            <h2 className="card-title">Category budgets</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLastMonth}
              loading={copying}
            >
              <CopyIcon size={16} />
              Copy last month
            </Button>
          </div>
          <ul className="budget-list">
            {rows.map(({ category, budget }) => (
              <BudgetRow
                key={category.id}
                category={category}
                budget={budget}
                spent={spentByCategory[category.id]?.total ?? 0}
                currency={currency}
                onSave={handleSaveLimit}
                onRemove={(removedCategory, removedBudget) =>
                  setDeletingBudget({
                    category: removedCategory,
                    budget: removedBudget,
                  })
                }
              />
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingBudget)}
        title="Remove budget?"
        message={
          deletingBudget
            ? `Remove the ${deletingBudget.category.name} budget for ${formatMonthKey(
                month
              )}? Your transactions are not affected.`
            : ""
        }
        confirmLabel="Remove"
        loading={deleteLoading}
        onConfirm={handleDeleteBudget}
        onCancel={() => {
          if (!deleteLoading) setDeletingBudget(null);
        }}
      />
    </section>
  );
}
