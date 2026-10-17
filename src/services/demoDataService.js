import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_CATEGORIES } from "../utils/constants";

const MONTHS_OF_HISTORY = 3;
const BATCH_SIZE = 400;

const EXPENSE_TEMPLATES = [
  {
    categoryId: "expense-food",
    min: 12,
    max: 90,
    perMonth: 4,
    notes: ["Weekly groceries", "Lunch with the team", "Dinner takeout", "Coffee run"],
  },
  {
    categoryId: "expense-transport",
    min: 6,
    max: 45,
    perMonth: 3,
    notes: ["Fuel top-up", "Metro card reload", "Ride share trip", "Bus pass"],
  },
  {
    categoryId: "expense-shopping",
    min: 15,
    max: 140,
    perMonth: 2,
    notes: ["Clothing", "Home supplies", "Electronics accessory", "Gift for a friend"],
  },
  {
    categoryId: "expense-bills",
    min: 25,
    max: 80,
    perMonth: 2,
    notes: ["Electricity bill", "Internet bill", "Mobile plan"],
  },
  {
    categoryId: "expense-health",
    min: 10,
    max: 70,
    perMonth: 1,
    notes: ["Pharmacy", "Gym membership", "Doctor visit"],
  },
  {
    categoryId: "expense-entertainment",
    min: 8,
    max: 60,
    perMonth: 2,
    notes: ["Streaming subscription", "Movie night", "Concert tickets"],
  },
];

function categoryFor(categoryId) {
  return DEFAULT_CATEGORIES.find((category) => category.id === categoryId);
}

function randomAmount(min, max, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((min + Math.random() * (max - min)) * factor) / factor;
}

function randomDay(dayLimit) {
  return Math.floor(Math.random() * dayLimit) + 1;
}

function randomNote(notes) {
  return notes[Math.floor(Math.random() * notes.length)];
}

function toTransactionData(entry) {
  const category = categoryFor(entry.categoryId);
  return {
    type: category.type,
    amount: entry.amount,
    categoryId: category.id,
    categoryName: category.name,
    date: Timestamp.fromDate(entry.date),
    note: entry.note,
    isDemo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function buildEntries(monthDate, today) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const dayLimit = isCurrentMonth
    ? today.getDate()
    : new Date(year, month + 1, 0).getDate();
  const entries = [];

  const push = (categoryId, day, amount, note) => {
    const safeDay = Math.max(1, Math.min(day, dayLimit));
    entries.push({
      categoryId,
      amount,
      note,
      date: new Date(year, month, safeDay, 12, 0, 0, 0),
    });
  };

  push("income-salary", 1, randomAmount(2600, 3400, 0), "Monthly salary");
  push("expense-rent", Math.min(2, dayLimit), randomAmount(620, 900, 0), "Monthly rent");

  if (Math.random() < 0.6) {
    push(
      "income-freelance",
      randomDay(dayLimit),
      randomAmount(120, 420, 0),
      "Freelance project"
    );
  }

  EXPENSE_TEMPLATES.forEach((template) => {
    for (let index = 0; index < template.perMonth; index += 1) {
      push(
        template.categoryId,
        randomDay(dayLimit),
        randomAmount(template.min, template.max),
        randomNote(template.notes)
      );
    }
  });

  return entries.map(toTransactionData);
}

export async function seedDemoData(uid) {
  if (!uid) {
    throw new Error("You need to be signed in to add demo data.");
  }

  const today = new Date();
  const payloads = [];

  for (let offset = MONTHS_OF_HISTORY - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    payloads.push(...buildEntries(monthDate, today));
  }

  if (payloads.length === 0) {
    throw new Error("Nothing to add.");
  }

  const transactionsRef = collection(db, "users", uid, "transactions");

  for (let start = 0; start < payloads.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    payloads.slice(start, start + BATCH_SIZE).forEach((payload) => {
      batch.set(doc(transactionsRef), payload);
    });
    await batch.commit();
  }

  return payloads.length;
}

export async function deleteDemoTransactions(uid) {
  if (!uid) {
    throw new Error("You need to be signed in to delete demo data.");
  }

  const q = query(
    collection(db, "users", uid, "transactions"),
    where("isDemo", "==", true)
  );
  const snapshot = await getDocs(q);
  const demoDocs = snapshot.docs;

  for (let start = 0; start < demoDocs.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    demoDocs
      .slice(start, start + BATCH_SIZE)
      .forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }

  return demoDocs.length;
}
