import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES } from "../utils/constants";

function profileRef(uid) {
  return doc(db, "users", uid, "settings", "profile");
}

export async function getProfile(uid) {
  const snapshot = await getDoc(profileRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function seedDefaultCategories(uid) {
  const categoriesRef = collection(db, "users", uid, "categories");
  const snapshot = await getDocs(categoriesRef);
  if (!snapshot.empty) return;

  const batch = writeBatch(db);
  DEFAULT_CATEGORIES.forEach(({ id, ...category }) => {
    batch.set(doc(categoriesRef, id), category);
  });
  await batch.commit();
}

export async function ensureUserProfile(user, overrides = {}) {
  const existingProfile = await getProfile(user.uid);

  if (!existingProfile) {
    const displayName =
      overrides.displayName ||
      user.displayName ||
      (user.email ? user.email.split("@")[0] : "User");

    await setDoc(profileRef(user.uid), {
      displayName,
      email: user.email ?? "",
      currency: "INR",
      createdAt: serverTimestamp(),
    });
  }

  await seedDefaultCategories(user.uid);

  return getProfile(user.uid);
}

export async function signUp(email, password, name) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await ensureUserProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function logIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function logInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function updateProfileData(user, updates) {
  if (!user?.uid) {
    throw new Error("You need to be signed in.");
  }
  if (!updates || typeof updates !== "object") {
    throw new Error("Profile updates are required.");
  }

  const payload = {};

  if (updates.displayName !== undefined) {
    const name = typeof updates.displayName === "string" ? updates.displayName.trim() : "";
    if (!name) {
      throw new Error("Display name is required.");
    }
    if (name.length > 60) {
      throw new Error("Display name must be 60 characters or fewer.");
    }
    payload.displayName = name;
  }

  if (updates.currency !== undefined) {
    const codes = SUPPORTED_CURRENCIES.map((currency) => currency.code);
    if (!codes.includes(updates.currency)) {
      throw new Error("That currency is not supported.");
    }
    payload.currency = updates.currency;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update.");
  }

  await updateDoc(profileRef(user.uid), payload);

  if (payload.displayName) {
    await updateProfile(user, { displayName: payload.displayName });
  }

  return payload;
}
