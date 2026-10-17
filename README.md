# SpendWise

SpendWise is a personal expense tracker with budget insights. Track income and expenses, set monthly budgets per category, and understand your spending through a dashboard, charts, reports and generated insights. All data is stored in your own Firebase project and synced in realtime.

Built as a React single-page app (Vite, JavaScript) with Firebase Authentication and Cloud Firestore, Chart.js for charts and jsPDF for report exports. No UI libraries — the interface uses a small plain-CSS design system with light and dark themes.

## Features

- **Authentication** — email/password sign-up and login, Google sign-in, password reset, protected and public routes, session-expiry handling.
- **Dashboard** — month navigation, KPI cards (income, expenses, net balance, savings rate) with month-over-month change, income vs expense, balance trend, category and daily spending charts, recent transactions, budget status and the top insights for the month.
- **Transactions** — add, edit and delete income/expense transactions with category, date and note; search and filter by type, category and date presets (including a custom range); client-side sorting and pagination; CSV export of the filtered list.
- **Budgets** — per-category monthly limits with progress bars (amber at 80%, red when over), remaining/over amounts, remove, "copy last month's budgets" and a summary card; a warning toast appears when a new expense crosses 80% or 100% of a category budget.
- **Reports** — monthly and yearly views: month summary, this month vs last month comparison chart, category breakdown with change vs last month, top expenses, highest-spending day, average daily spend, 12-month table with totals; PDF and CSV export for the selected month.
- **Insights** — generated warnings and tips: spending spikes, over-budget categories, savings-rate targets, projected month-end spend, biggest category and no-spend streaks.
- **Settings** — profile (display name), category management (add, edit, delete; deletion blocked while in use), currency (INR, USD, EUR, GBP, JPY), light/dark theme, full CSV export and one-click demo data for exploring the app.
- **UX details** — loading, empty and error states on every data view, accessible modals (focus trap, Esc to close), offline banner, responsive layout for mobile and desktop, 404 page.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 with Vite (JavaScript, no TypeScript) |
| Routing | react-router-dom |
| Backend | Firebase Authentication + Cloud Firestore (modular v9+ SDK, client-side only, no custom server) |
| Charts | Chart.js via react-chartjs-2 |
| Exports | jsPDF + jspdf-autotable (loaded on demand) |
| Styling | Hand-written CSS with custom properties (light/dark themes), no UI libraries |
| Tooling | ESLint (flat config) |

## Folder structure

```
├── public/                  # Static assets (favicon)
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI kit (Button, Modal, Input, Toast, Icons, ...)
│   │   ├── layout/          # App shell: Sidebar, Header, MobileTabBar, AuthLayout
│   │   ├── routing/         # Route guards, page titles
│   │   ├── transactions/    # Transaction table, filters, add/edit modal
│   │   ├── budgets/         # Budget row editing
│   │   ├── settings/        # Category management
│   │   ├── dashboard/       # KPI card and dashboard charts
│   │   ├── charts/          # Shared Chart.js setup, theme, options, card
│   │   ├── reports/         # Comparison chart, category breakdown table
│   │   └── insights/        # Insight cards
│   ├── context/             # AuthProvider, auth/toast contexts
│   ├── hooks/               # useTransactions, useCategories, useBudgets, useTheme, useOnlineStatus
│   ├── pages/               # Dashboard, Transactions, Budgets, Reports, Settings, auth pages, 404
│   ├── services/            # Firebase only lives here (firebase.js, auth/transaction/category/budget/demoData)
│   ├── styles/              # global.css (design system) + layout.css (app shell)
│   └── utils/               # Pure helpers: calc, dates, formatting, chart data, insights, reports, export
├── firestore.rules          # Firestore security rules
├── firebase.json            # Firebase Hosting configuration (SPA rewrite)
├── .firebaserc.example      # Template for the Firebase project binding
├── .env.example             # Template for the Firebase web app config
├── eslint.config.js
└── QA_CHECKLIST.md          # Manual QA checklist
```

Firestore data model (all under the signed-in user's uid):

- `users/{uid}/settings/profile` — display name, email, currency
- `users/{uid}/categories/{categoryId}` — name, type (income/expense), icon, color
- `users/{uid}/budgets/{YYYY-MM}_{categoryId}` — month, category, limit
- `users/{uid}/transactions/{transactionId}` — type, amount, category, date, note

Only single-field queries are used, so no composite indexes are required.

## Firebase setup

1. **Create a Firebase project** — go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (Google Analytics is optional).
2. **Enable Authentication providers** — open **Build → Authentication → Get started**, then in **Sign-in method** enable:
   - **Email/Password**
   - **Google** (pick a support email)
3. **Create the Firestore database** — open **Build → Firestore Database → Create database**, choose **production mode** and a region close to your users.
4. **Register a web app** — open **Project settings → General → Your apps → Add app → Web (</>)**, give it a nickname and copy the `firebaseConfig` values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
5. **Create your `.env`** — copy `.env.example` to `.env` and fill in the values from step 4:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

6. **Publish the security rules** — open **Firestore Database → Rules**, replace the editor contents with [`firestore.rules`](./firestore.rules) and click **Publish**. See [Firestore rules](#firestore-rules) below.

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The dev server prints a local URL (typically http://localhost:5173). Sign up with any email/password or with Google — a profile and the default categories are created automatically. Use **Settings → Preferences → Add demo data** if you want three months of sample transactions to explore.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build (output in `dist/`)
- `npm run lint` — run ESLint over the source
- `npm run preview` — preview the production build locally

## Deploy to Firebase Hosting

The repository includes `firebase.json` configured to serve the `dist/` folder with a single-page-app rewrite (every route falls back to `/index.html`), so client-side routes work on refresh.

1. **Bind the project** — copy `.firebaserc.example` to `.firebaserc` and replace `your-firebase-project-id` with your project ID (from the Firebase Console), or run `firebase use --add` and select the project.

2. **Deploy**:

   ```bash
   npm install -g firebase-tools
   firebase login
   npm run build
   firebase deploy --only hosting
   ```

   The command prints the hosting URL (e.g. `https://your-project-id.web.app`). Add that domain to **Authentication → Settings → Authorized domains** if you use Google sign-in (see troubleshooting below).

## Deploy to Vercel

The repository is also ready for [Vercel](https://vercel.com) — the Vite preset is detected automatically (build command `npm run build`, output `dist`).

1. **Import the project** — in Vercel choose **Add New → Project**, import the Git repository and keep the detected Vite settings.
2. **Add environment variables** — under **Project → Settings → Environment Variables**, add the six `VITE_FIREBASE_*` keys from your `.env` (enable them for Production, Preview and Development), then deploy. Vite inlines the values at build time, so they must exist before the build runs.
3. **Routing** — [`vercel.json`](./vercel.json) rewrites all routes to `/index.html`, so deep links like `/reports` work on refresh.
4. **Authorize the domain** — add your deployment domain (e.g. `spendwise.vercel.app`) under **Authentication → Settings → Authorized domains** in the Firebase Console so Google sign-in works. Generated preview URLs must be added individually.

Only the `VITE_FIREBASE_*` values are needed, and Firebase web config values are public identifiers by design — data is protected by `firestore.rules` and the authorized-domains list. No other keys or secrets are stored in the repository.

## Firestore rules

All app data lives under `users/{uid}/**` and is protected by Firestore security rules: each user can only read and write their own documents, transactions are validated (`type` income/expense, positive numeric `amount`, `note` under 300 characters, optional boolean `isDemo`), and everything else is denied.

To apply the rules:

1. Open the [Firebase Console](https://console.firebase.google.com/) and select the SpendWise project.
2. Go to **Firestore Database → Rules**.
3. Replace the editor contents with the contents of the [`firestore.rules`](./firestore.rules) file in this repository.
4. Click **Publish**.

No other Firestore setup (indexes, collections) is required: the app only uses single-field queries, so composite indexes are never needed.

## Troubleshooting

**The app shows an error about missing Firebase environment values**
- Make sure `.env` exists in the project root (copy `.env.example`) and that all six `VITE_FIREBASE_*` keys are filled with values from **Project settings → Your apps**.
- Restart the dev server (`npm run dev`) after editing `.env` — Vite only reads environment files at startup.
- Keys must start with `VITE_` and values should not be wrapped in quotes.

**"Missing or insufficient permissions" / `permission-denied` errors**
- The security rules were not published (or were overwritten). Re-publish [`firestore.rules`](./firestore.rules) from **Firestore Database → Rules**.
- Check that the project in your `.env` (`VITE_FIREBASE_PROJECT_ID`) is the same project whose rules you published.
- Make sure you are signed in — the rules deny all access to signed-out users by design.

**Google sign-in fails with `auth/unauthorized-domain`**
- Add the domain you are using under **Authentication → Settings → Authorized domains**: `localhost` for local development and your `*.web.app` / custom domain after deploying to Firebase Hosting.

**Deep links return 404 after deploying**
- The SPA rewrite is missing or the wrong folder was deployed. Confirm `firebase.json` is present with `"public": "dist"` and a rewrite of `**` to `/index.html`, run `npm run build`, then `firebase deploy --only hosting`.

**Build fails after changing `.env` values**
- Ensure there are no typos in the variable names — the app validates all six keys in `src/services/firebase.js` and reports the missing ones in the browser console.
