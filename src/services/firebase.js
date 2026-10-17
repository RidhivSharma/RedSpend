import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingEnvVars = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnvVars.length > 0) {
  console.error(
    `[SpendWise] Missing Firebase environment values: ${missingEnvVars.join(", ")}. ` +
      "Copy .env.example to .env, fill in the VITE_FIREBASE_* values and restart the dev server."
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
