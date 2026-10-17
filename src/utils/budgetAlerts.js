import { monthKey, toDate } from "./dateHelpers";

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function amountOf(transaction) {
  const amount = Number(transaction?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function budgetAlertOnAdd({ transaction, budget, existingTransactions = [] }) {
  if (!transaction || !budget || transaction.type !== "expense") return null;

  const limit = Number(budget.limit);
  if (!Number.isFinite(limit) || limit <= 0) return null;

  const date = toDate(transaction.date);
  if (!date) return null;
  const month = monthKey(date);

  const spentBefore = existingTransactions.reduce((sum, item) => {
    if (!item || item.type !== "expense" || item.categoryId !== transaction.categoryId) {
      return sum;
    }
    const itemDate = toDate(item.date);
    if (!itemDate || monthKey(itemDate) !== month) return sum;
    return sum + amountOf(item);
  }, 0);

  const amount = amountOf(transaction);
  if (amount <= 0) return null;

  const before = (spentBefore / limit) * 100;
  const after = ((spentBefore + amount) / limit) * 100;

  if (before < 100 && after >= 100) {
    return {
      level: "over",
      percent: after,
      month,
      limit,
      spentAfter: roundMoney(spentBefore + amount),
    };
  }

  if (before < 80 && after >= 80) {
    return {
      level: "approaching",
      percent: after,
      month,
      limit,
      spentAfter: roundMoney(spentBefore + amount),
    };
  }

  return null;
}
