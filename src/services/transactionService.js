import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const TRANSACTION_TYPES = ["income", "expense"];
export const MAX_NOTE_LENGTH = 300;

function transactionsRef(uid) {
  return collection(db, "users", uid, "transactions");
}

function toTimestamp(value) {
  if (value instanceof Timestamp) return value;
  if (value && typeof value.toDate === "function") {
    return Timestamp.fromDate(value.toDate());
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Transaction date is invalid.");
  }
  return Timestamp.fromDate(date);
}

function toTransaction(document) {
  return { id: document.id, ...document.data() };
}

function validateTransactionInput(data, { partial = false } = {}) {
  if (!data || typeof data !== "object") {
    throw new Error("Transaction data is required.");
  }

  const result = {};

  if (!partial || data.type !== undefined) {
    if (!TRANSACTION_TYPES.includes(data.type)) {
      throw new Error("Transaction type must be income or expense.");
    }
    result.type = data.type;
  }

  if (!partial || data.amount !== undefined) {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be a number greater than 0.");
    }
    result.amount = amount;
  }

  if (!partial || data.categoryId !== undefined) {
    if (typeof data.categoryId !== "string" || !data.categoryId.trim()) {
      throw new Error("A category is required.");
    }
    result.categoryId = data.categoryId;
  }

  if (!partial || data.categoryName !== undefined) {
    if (typeof data.categoryName !== "string" || !data.categoryName.trim()) {
      throw new Error("A category name is required.");
    }
    result.categoryName = data.categoryName;
  }

  if (!partial || data.date !== undefined) {
    if (!data.date) {
      throw new Error("A date is required.");
    }
    result.date = toTimestamp(data.date);
  }

  if (!partial || data.note !== undefined) {
    const note = data.note ?? "";
    if (typeof note !== "string") {
      throw new Error("Note must be text.");
    }
    if (note.length > MAX_NOTE_LENGTH) {
      throw new Error(`Note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
    }
    result.note = note;
  }

  if (partial && Object.keys(result).length === 0) {
    throw new Error("Nothing to update.");
  }

  return result;
}

export async function addTransaction(uid, data) {
  const payload = validateTransactionInput(data);
  const ref = await addDoc(transactionsRef(uid), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransaction(uid, transactionId, data) {
  if (!transactionId) {
    throw new Error("A transaction id is required.");
  }
  const updates = validateTransactionInput(data, { partial: true });
  await updateDoc(doc(db, "users", uid, "transactions", transactionId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(uid, transactionId) {
  if (!transactionId) {
    throw new Error("A transaction id is required.");
  }
  await deleteDoc(doc(db, "users", uid, "transactions", transactionId));
}

export function subscribeToTransactions(uid, callback, errorCallback) {
  const q = query(transactionsRef(uid), orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(toTransaction));
    },
    (error) => {
      if (typeof errorCallback === "function") errorCallback(error);
    }
  );
}
