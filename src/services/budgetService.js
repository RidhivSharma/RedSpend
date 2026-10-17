import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function budgetsRef(uid) {
  return collection(db, "users", uid, "budgets");
}

function toBudget(document) {
  return { id: document.id, ...document.data() };
}

export function buildBudgetId(month, categoryId) {
  return `${month}_${categoryId}`;
}

function validateBudgetInput(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Budget data is required.");
  }
  if (typeof data.month !== "string" || !MONTH_PATTERN.test(data.month)) {
    throw new Error("Budget month must use the YYYY-MM format.");
  }
  if (typeof data.categoryId !== "string" || !data.categoryId.trim()) {
    throw new Error("A category is required for a budget.");
  }
  if (typeof data.categoryName !== "string" || !data.categoryName.trim()) {
    throw new Error("A category name is required for a budget.");
  }

  const limit = Number(data.limit);
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("Budget limit must be a number greater than 0.");
  }

  return {
    month: data.month,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    limit,
  };
}

export async function setBudget(uid, data) {
  const payload = validateBudgetInput(data);
  const budgetId = buildBudgetId(payload.month, payload.categoryId);
  await setDoc(doc(db, "users", uid, "budgets", budgetId), payload, { merge: true });
  return budgetId;
}

export async function deleteBudget(uid, month, categoryId) {
  if (!month || !categoryId) {
    throw new Error("A month and category are required to delete a budget.");
  }
  await deleteDoc(doc(db, "users", uid, "budgets", buildBudgetId(month, categoryId)));
}

export async function getBudget(uid, month, categoryId) {
  const snapshot = await getDoc(
    doc(db, "users", uid, "budgets", buildBudgetId(month, categoryId))
  );
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getBudgetsByMonth(uid, month) {
  const q = query(budgetsRef(uid), where("month", "==", month));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toBudget);
}

export function subscribeToBudgets(uid, month, callback, errorCallback) {
  const q = query(budgetsRef(uid), where("month", "==", month));

  return onSnapshot(
    q,
    (snapshot) => {
      const budgets = snapshot.docs
        .map(toBudget)
        .sort((a, b) => (a.categoryName || "").localeCompare(b.categoryName || ""));
      callback(budgets);
    },
    (error) => {
      if (typeof errorCallback === "function") errorCallback(error);
    }
  );
}
