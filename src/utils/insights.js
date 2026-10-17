import { groupByCategory, totalExpense, totalIncome } from "./calc";
import { monthTotals, transactionsInMonth } from "./chartData";
import {
  daysInMonth,
  elapsedDaysInMonth,
  formatMonthKey,
  isCurrentMonth,
  monthKey,
  shiftMonthKey,
  toDate,
} from "./dateHelpers";
import { formatCurrency } from "./format";

const SEVERITY = { warning: 0, success: 1, info: 2 };

export function generateInsights(
  transactions = [],
  budgets = [],
  month = monthKey(new Date()),
  currency = "INR"
) {
  const insights = [];
  const allTransactions = Array.isArray(transactions)
    ? transactions.filter(Boolean)
    : [];
  const monthBudgets = Array.isArray(budgets) ? budgets.filter(Boolean) : [];

  const monthTransactions = transactionsInMonth(allTransactions, month);
  const income = totalIncome(monthTransactions);
  const expense = totalExpense(monthTransactions);
  const previous = monthTotals(allTransactions, shiftMonthKey(month, -1));
  const monthLabel = formatMonthKey(month);

  const spentByCategory = groupByCategory(
    monthTransactions.filter((transaction) => transaction.type === "expense")
  );

  if (income === 0) {
    insights.push({
      type: "warning",
      title: "No income recorded",
      message: `No income was recorded for ${monthLabel}. Add income to track your savings rate.`,
    });
  }

  if (previous.expense > 0) {
    const change = ((expense - previous.expense) / previous.expense) * 100;
    const rounded = Math.abs(Math.round(change));
    if (rounded > 15) {
      const direction = change > 0 ? "up" : "down";
      insights.push({
        type: change > 0 ? "warning" : "success",
        title: `Spending ${direction} ${rounded}% vs last month`,
        message: `You spent ${formatCurrency(expense, currency)} this month, compared with ${formatCurrency(previous.expense, currency)} last month.`,
      });
    }
  }

  monthBudgets
    .map((budget) => {
      const spent = spentByCategory[budget.categoryId]?.total ?? 0;
      const limit = Number(budget.limit) || 0;
      return { budget, spent, limit, over: spent - limit };
    })
    .filter((row) => row.limit > 0 && row.spent > row.limit)
    .slice(0, 3)
    .forEach((row) => {
      insights.push({
        type: "warning",
        title: `Over budget: ${row.budget.categoryName || "Category"}`,
        message: `Spent ${formatCurrency(row.spent, currency)} of ${formatCurrency(row.limit, currency)} — over by ${formatCurrency(row.over, currency)}.`,
      });
    });

  if (income > 0) {
    const rate = ((income - expense) / income) * 100;
    const rounded = Math.round(rate);
    if (rate >= 20) {
      insights.push({
        type: "success",
        title: "Healthy savings rate",
        message: `You are saving ${rounded}% of your income this month — above the 20% target.`,
      });
    } else if (rate < 0) {
      insights.push({
        type: "warning",
        title: "Spending exceeds income",
        message: `You spent ${formatCurrency(expense - income, currency)} more than you earned — savings rate is ${rounded}%.`,
      });
    } else {
      insights.push({
        type: "warning",
        title: "Low savings rate",
        message: `Your savings rate is ${rounded}% this month, below the 20% target.`,
      });
    }
  }

  if (isCurrentMonth(month) && expense > 0) {
    const elapsed = elapsedDaysInMonth(month);
    const total = daysInMonth(month);
    if (elapsed > 0 && elapsed < total) {
      const projected = (expense / elapsed) * total;
      const totalBudget = monthBudgets.reduce(
        (sum, budget) => sum + (Number(budget.limit) || 0),
        0
      );
      if (totalBudget > 0 && projected > totalBudget) {
        insights.push({
          type: "warning",
          title: "Projected to exceed budget",
          message: `At the current pace you will spend about ${formatCurrency(projected, currency)} by month end, above your total budget of ${formatCurrency(totalBudget, currency)}.`,
        });
      } else {
        insights.push({
          type: "info",
          title: "Projected month-end spend",
          message: `At the current pace you will spend about ${formatCurrency(projected, currency)} by month end.`,
        });
      }
    }
  }

  if (expense > 0) {
    const top = Object.values(spentByCategory).sort(
      (a, b) => b.total - a.total
    )[0];
    if (top) {
      const share = Math.round((top.total / expense) * 100);
      insights.push({
        type: "info",
        title: `${top.categoryName} is your biggest category`,
        message: `${top.categoryName} accounts for ${share}% of this month's spending (${formatCurrency(top.total, currency)}).`,
      });
    }
  }

  const lastElapsedDay = elapsedDaysInMonth(month);
  if (lastElapsedDay > 0) {
    const spentDays = new Set();
    monthTransactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;
      const date = toDate(transaction.date);
      if (date) spentDays.add(date.getDate());
    });
    let streak = 0;
    for (let day = lastElapsedDay; day >= 1; day -= 1) {
      if (spentDays.has(day)) break;
      streak += 1;
    }
    if (streak >= 3) {
      insights.push({
        type: "success",
        title: `${streak}-day no-spend streak`,
        message: `No expenses for the last ${streak} days in a row${isCurrentMonth(month) ? " — keep it up!" : "."}`,
      });
    }
  }

  return insights.sort((a, b) => SEVERITY[a.type] - SEVERITY[b.type]);
}
