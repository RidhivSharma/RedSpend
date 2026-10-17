import { monthKey, toDate } from "./dateHelpers";

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function amountOf(transaction) {
  const amount = Number(transaction?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

function addToBucket(bucket, transaction) {
  const amount = amountOf(transaction);
  if (transaction.type === "income") {
    bucket.income += amount;
  } else if (transaction.type === "expense") {
    bucket.expense += amount;
  }
}

function finalizeBucket(bucket) {
  bucket.income = roundMoney(bucket.income);
  bucket.expense = roundMoney(bucket.expense);
  bucket.balance = roundMoney(bucket.income - bucket.expense);
}

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function totalIncome(transactions = []) {
  return roundMoney(
    transactions.reduce(
      (sum, transaction) =>
        transaction?.type === "income" ? sum + amountOf(transaction) : sum,
      0
    )
  );
}

export function totalExpense(transactions = []) {
  return roundMoney(
    transactions.reduce(
      (sum, transaction) =>
        transaction?.type === "expense" ? sum + amountOf(transaction) : sum,
      0
    )
  );
}

export function balance(transactions = []) {
  return roundMoney(totalIncome(transactions) - totalExpense(transactions));
}

export function groupByCategory(transactions = []) {
  const groups = {};

  transactions.forEach((transaction) => {
    if (!transaction) return;
    const key = transaction.categoryId || "uncategorized";
    if (!groups[key]) {
      groups[key] = {
        categoryId: key,
        categoryName: transaction.categoryName || "Uncategorized",
        type: transaction.type,
        total: 0,
        count: 0,
      };
    }
    groups[key].total += amountOf(transaction);
    groups[key].count += 1;
  });

  Object.values(groups).forEach((bucket) => {
    bucket.total = roundMoney(bucket.total);
  });

  return groups;
}

export function groupByMonth(transactions = []) {
  const groups = {};

  transactions.forEach((transaction) => {
    if (!transaction) return;
    const date = toDate(transaction.date);
    if (!date) return;
    const key = monthKey(date);
    if (!groups[key]) {
      groups[key] = { month: key, income: 0, expense: 0, balance: 0 };
    }
    addToBucket(groups[key], transaction);
  });

  Object.values(groups).forEach(finalizeBucket);

  return groups;
}

export function groupByDay(transactions = []) {
  const groups = {};

  transactions.forEach((transaction) => {
    if (!transaction) return;
    const date = toDate(transaction.date);
    if (!date) return;
    const key = dayKey(date);
    if (!groups[key]) {
      groups[key] = { date: key, income: 0, expense: 0, balance: 0 };
    }
    addToBucket(groups[key], transaction);
  });

  Object.values(groups).forEach(finalizeBucket);

  return groups;
}
