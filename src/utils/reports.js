import {
  buildCategorySpending,
  buildMonthlySeries,
  transactionsInMonth,
} from "./chartData";
import {
  daysInMonth,
  elapsedDaysInMonth,
  shiftMonthKey,
  toDate,
} from "./dateHelpers";

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

export function buildCategoryBreakdown(
  transactions = [],
  month,
  categoriesById = {}
) {
  const current = buildCategorySpending(
    transactionsInMonth(transactions, month),
    categoriesById
  );
  const previousRows = buildCategorySpending(
    transactionsInMonth(transactions, shiftMonthKey(month, -1)),
    categoriesById
  );
  const previousByCategory = {};
  previousRows.forEach((row) => {
    previousByCategory[row.categoryId] = row.value;
  });

  const total = current.reduce((sum, row) => sum + row.value, 0);

  return current.map((row) => {
    const previous = previousByCategory[row.categoryId] ?? 0;
    return {
      ...row,
      icon: categoriesById[row.categoryId]?.icon || "🏷️",
      share: total > 0 ? (row.value / total) * 100 : 0,
      previous,
      change: previous > 0 ? ((row.value - previous) / previous) * 100 : null,
    };
  });
}

export function buildComparisonSeries(
  transactions = [],
  month,
  categoriesById = {},
  limit = 8
) {
  const breakdown = buildCategoryBreakdown(transactions, month, categoriesById);
  const rows = breakdown.map((row) => ({
    label: row.label,
    current: row.value,
    previous: row.previous,
  }));
  const known = new Set(breakdown.map((row) => row.categoryId));

  buildCategorySpending(
    transactionsInMonth(transactions, shiftMonthKey(month, -1)),
    categoriesById
  ).forEach((row) => {
    if (!known.has(row.categoryId)) {
      rows.push({ label: row.label, current: 0, previous: row.value });
    }
  });

  const top = rows
    .sort((a, b) => b.current - a.current || b.previous - a.previous)
    .slice(0, limit);

  return {
    labels: top.map((row) => row.label),
    current: top.map((row) => row.current),
    previous: top.map((row) => row.previous),
  };
}

export function buildTopExpenses(transactions = [], month, limit = 5) {
  return transactionsInMonth(transactions, month)
    .filter((transaction) => transaction.type === "expense")
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, limit);
}

export function buildMonthDayStats(transactions = [], month) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  const days = daysInMonth(month);
  const daily = Array.from({ length: days }, () => 0);

  transactionsInMonth(transactions, month).forEach((transaction) => {
    if (transaction.type !== "expense") return;
    const date = toDate(transaction.date);
    if (!date) return;
    daily[date.getDate() - 1] += Number(transaction.amount) || 0;
  });

  const totalSpent = roundMoney(daily.reduce((sum, value) => sum + value, 0));
  const elapsedDays = elapsedDaysInMonth(month);

  let highestIndex = -1;
  daily.forEach((value, index) => {
    if (value > 0 && (highestIndex === -1 || value > daily[highestIndex])) {
      highestIndex = index;
    }
  });

  return {
    totalSpent,
    elapsedDays,
    averageDaily: elapsedDays > 0 ? roundMoney(totalSpent / elapsedDays) : 0,
    highestDay:
      highestIndex === -1
        ? null
        : {
            date: new Date(year, monthNumber - 1, highestIndex + 1),
            amount: roundMoney(daily[highestIndex]),
          },
  };
}

export function buildYearlyReport(transactions = [], year) {
  const keys = Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`
  );
  const series = buildMonthlySeries(transactions, keys);

  const rows = keys.map((key, index) => {
    const income = series.income[index];
    const expense = series.expense[index];
    const net = roundMoney(income - expense);
    return {
      month: key,
      label: new Intl.DateTimeFormat("en-IN", { month: "long" }).format(
        new Date(year, index, 1)
      ),
      income,
      expense,
      net,
      savingsRate: income > 0 ? Math.round((net / income) * 100) : null,
    };
  });

  const totals = rows.reduce(
    (acc, row) => ({
      income: acc.income + row.income,
      expense: acc.expense + row.expense,
    }),
    { income: 0, expense: 0 }
  );
  totals.income = roundMoney(totals.income);
  totals.expense = roundMoney(totals.expense);
  totals.net = roundMoney(totals.income - totals.expense);
  totals.savingsRate =
    totals.income > 0 ? Math.round((totals.net / totals.income) * 100) : null;

  return { rows, totals, series };
}
