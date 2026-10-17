import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export const CATEGORY_TYPES = ["income", "expense"];

const DEFAULT_ICON = "🏷️";
const DEFAULT_COLOR = "#64748b";
export const MAX_NAME_LENGTH = 40;

function categoriesRef(uid) {
  return collection(db, "users", uid, "categories");
}

function toCategory(document) {
  return { id: document.id, ...document.data() };
}

function validateName(name) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) {
    throw new Error("Category name is required.");
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Category name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }
  return trimmed;
}

export function subscribeToCategories(uid, callback, errorCallback) {
  const q = query(categoriesRef(uid), orderBy("name"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(toCategory));
    },
    (error) => {
      if (typeof errorCallback === "function") errorCallback(error);
    }
  );
}

export async function addCategory(uid, data) {
  if (!data || typeof data !== "object") {
    throw new Error("Category data is required.");
  }
  if (!CATEGORY_TYPES.includes(data.type)) {
    throw new Error("Category type must be income or expense.");
  }

  const ref = await addDoc(categoriesRef(uid), {
    name: validateName(data.name),
    type: data.type,
    icon: data.icon || DEFAULT_ICON,
    color: data.color || DEFAULT_COLOR,
  });
  return ref.id;
}

export async function updateCategory(uid, categoryId, updates) {
  if (!categoryId) {
    throw new Error("A category id is required.");
  }
  if (!updates || typeof updates !== "object") {
    throw new Error("Category updates are required.");
  }

  const payload = {};

  if (updates.name !== undefined) {
    payload.name = validateName(updates.name);
  }
  if (updates.type !== undefined) {
    if (!CATEGORY_TYPES.includes(updates.type)) {
      throw new Error("Category type must be income or expense.");
    }
    payload.type = updates.type;
  }
  if (updates.icon !== undefined) {
    payload.icon = updates.icon || DEFAULT_ICON;
  }
  if (updates.color !== undefined) {
    payload.color = updates.color || DEFAULT_COLOR;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update.");
  }

  await updateDoc(doc(db, "users", uid, "categories", categoryId), payload);
}

export async function deleteCategory(uid, categoryId) {
  if (!categoryId) {
    throw new Error("A category id is required.");
  }

  const usageSnapshot = await getDocs(
    query(
      collection(db, "users", uid, "transactions"),
      where("categoryId", "==", categoryId),
      limit(1)
    )
  );

  if (!usageSnapshot.empty) {
    throw new Error(
      "This category is used by existing transactions. Move or delete those transactions first."
    );
  }

  await deleteDoc(doc(db, "users", uid, "categories", categoryId));
}
