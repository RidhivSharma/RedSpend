import { monthKey, shiftMonthKey, toDate } from "./dateHelpers";
import { balance, groupByCategory, totalExpense, totalIncome } from "./calc";

const FALLBACK_PALETTE = [
  "#4f46e5",
  "#0ea5e9",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#64748b",
];

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value) {
  return Math.round(value * 10) / 10;
}

function amountOf(transaction) {
  const amount = Number(transaction?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function transactionsInMonth(transactions = [], month) {
  return transactions.filter((transaction) => {
    const date = toDate(transaction?.date);
    return Boolean(date) && monthKey(date) === month;
  });
}

export function monthTotals(transactions = [], month) {
  const monthTransactions = transactionsInMonth(transactions, month);
  return {
    income: totalIncome(monthTransactions),
    expense: totalExpense(monthTransactions),
    balance: balance(monthTransactions),
  };
}

export function percentChange(current, previous) {
  const currentValue = Number(current) || 0;
  const previousValue = Number(previous) || 0;
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }
  return roundPercent(
    ((currentValue - previousValue) / Math.abs(previousValue)) * 100
  );
}

export function savingsRate(income, expense) {
  const incomeValue = Number(income) || 0;
  if (incomeValue <= 0) return null;
  return roundPercent(((incomeValue - (Number(expense) || 0)) / incomeValue) * 100);
}

export function buildKpis(transactions = [], month) {
  const current = monthTotals(transactions, month);
  const previous = monthTotals(transactions, shiftMonthKey(month, -1));
  const currentRate = savingsRate(current.income, current.expense);
  const previousRate = savingsRate(previous.income, previous.expense);

  return [
    {
      id: "income",
      label: "Total income",
      value: current.income,
      valueType: "currency",
      change: percentChange(current.income, previous.income),
      changeType: "percent",
      positiveIsGood: true,
    },
    {
      id: "expense",
      label: "Total expenses",
      value: current.expense,
      valueType: "currency",
      change: percentChange(current.expense, previous.expense),
      changeType: "percent",
      positiveIsGood: false,
    },
    {
      id: "balance",
      label: "Net balance",
      value: current.balance,
      valueType: "currency",
      change: percentChange(current.balance, previous.balance),
      changeType: "percent",
      positiveIsGood: true,
    },
    {
      id: "savings",
      label: "Savings rate",
      value: currentRate,
      valueType: "percent",
      change:
        currentRate === null || previousRate === null
          ? null
          : roundPercent(currentRate - previousRate),
      changeType: "points",
      positiveIsGood: true,
    },
  ];
}

export function monthShortLabel(month) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  const date = new Date(year, monthNumber - 1, 1);
  if (Number.isNaN(date.getTime())) return String(month);
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
}

export function buildMonthlySeries(transactions = [], monthKeys = []) {
  const buckets = {};

  transactions.forEach((transaction) => {
    const date = toDate(transaction?.date);
    if (!date) return;
    const key = monthKey(date);
    if (!buckets[key]) {
      buckets[key] = { income: 0, expense: 0 };
    }
    if (transaction.type === "income") {
      buckets[key].income += amountOf(transaction);
    } else if (transaction.type === "expense") {
      buckets[key].expense += amountOf(transaction);
    }
  });

  return {
    labels: monthKeys.map(monthShortLabel),
    income: monthKeys.map((key) => roundMoney(buckets[key]?.income ?? 0)),
    expense: monthKeys.map((key) => roundMoney(buckets[key]?.expense ?? 0)),
  };
}

export function buildBalanceSeries(transactions = [], monthKeys = []) {
  const monthly = buildMonthlySeries(transactions, monthKeys);
  let running = 0;
  const values = monthly.income.map((income, index) => {
    running += income - monthly.expense[index];
    return roundMoney(running);
  });
  return { labels: monthly.labels, values };
}

export function buildCategorySpending(transactions = [], categoriesById = {}) {
  const expenses = transactions.filter(
    (transaction) => transaction?.type === "expense"
  );
  const groups = groupByCategory(expenses);

  return Object.values(groups)
    .sort((a, b) => b.total - a.total)
    .map((bucket, index) => {
      const meta = categoriesById[bucket.categoryId];
      return {
        categoryId: bucket.categoryId,
        label: bucket.categoryName || meta?.name || "Uncategorized",
        value: bucket.total,
        color: meta?.color || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
      };
    });
}

export function buildDailySpending(transactions = [], month) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  const daysInMonth =
    Number.isFinite(year) && Number.isFinite(monthNumber)
      ? new Date(year, monthNumber, 0).getDate()
      : 31;
  const values = Array.from({ length: daysInMonth }, () => 0);

  transactions.forEach((transaction) => {
    if (!transaction || transaction.type !== "expense") return;
    const date = toDate(transaction.date);
    if (!date || monthKey(date) !== month) return;
    values[date.getDate() - 1] += amountOf(transaction);
  });

  return {
    labels: values.map((_, index) => String(index + 1)),
    values: values.map(roundMoney),
  };
}

export function buildBudgetHighlights(
  budgets = [],
  transactions = [],
  month,
  limit = 3
) {
  const spentByCategory = groupByCategory(
    transactionsInMonth(transactions, month).filter(
      (transaction) => transaction.type === "expense"
    )
  );

  return budgets
    .map((budget) => {
      const spent = spentByCategory[budget.categoryId]?.total ?? 0;
      const limitValue = Number(budget.limit) || 0;
      const percent = limitValue > 0 ? (spent / limitValue) * 100 : 0;
      return {
        categoryId: budget.categoryId,
        categoryName: budget.categoryName || "Category",
        spent: roundMoney(spent),
        limit: limitValue,
        percent: Math.round(percent),
        tone: percent > 100 ? "danger" : percent >= 80 ? "warning" : "primary",
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);
}

export function buildRecentTransactions(transactions = [], limit = 5) {
  return [...transactions]
    .sort(
      (a, b) =>
        (toDate(b?.date)?.getTime() ?? 0) - (toDate(a?.date)?.getTime() ?? 0)
    )
    .slice(0, limit);
}
