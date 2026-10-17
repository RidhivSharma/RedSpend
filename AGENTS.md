# AGENTS.md

PROJECT: Expense Tracker with Budget Insights.

STRICT STACK: React.js (Vite, JavaScript, not TypeScript), Firebase (Authentication + Firestore, modular v9+ SDK), Chart.js via react-chartjs-2. No other frameworks. No UI libraries, no Tailwind: use plain CSS with CSS variables. Allowed small utilities only: react-router-dom, jspdf, jspdf-autotable.

NO CUSTOM BACKEND: all data goes through Firebase client SDK from a service layer.

FOLDER STRUCTURE: src/{components,pages,services,context,hooks,utils,styles}. Firebase code only lives in src/services. Components never call Firestore directly.

CODE RULES: functional components and hooks only; every async call has try/catch with user-visible error messages; every data view has loading, empty and error states; all forms validate input; no hardcoded secrets, only import.meta.env.VITE_* values; money is displayed with Intl.NumberFormat.

FIRESTORE PATHS: users/{uid}/transactions, users/{uid}/categories, users/{uid}/budgets, users/{uid}/settings/profile.

WORKFLOW: after every task, run `npm run build` and fix all errors and warnings before finishing. Keep a short CHANGELOG.md updated per phase.
