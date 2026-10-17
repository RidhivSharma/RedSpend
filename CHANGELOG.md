# Changelog

All notable changes to RedSpend are documented in this file.

## Phase 1 — Project scaffold and app shell (2026-10-16)

### Added

- Vite + React (JavaScript) project scaffold with `dev`, `build` and `preview` scripts.
- Runtime dependencies: react-router-dom, firebase, chart.js, react-chartjs-2, jspdf, jspdf-autotable.
- Firebase client initialization in `src/services/firebase.js` using `VITE_FIREBASE_*` environment variables only.
- `.env.example` documenting the required Firebase environment keys.
- Routes: `/login`, `/signup`, `/` (Dashboard), `/transactions`, `/budgets`, `/reports`, `/settings`, plus a catch-all redirect to `/`.
- Placeholder pages for every route (title only).
- App shell layout: desktop sidebar with "SpendWise" logo and active nav state, sticky header with page title, theme toggle and avatar placeholder, and a bottom tab bar on screens under 768px.
- Design system in `src/styles/`: `global.css` (CSS variables for light and dark themes via `[data-theme]`, spacing scale, radii, shadows, font stack) and `layout.css` (shell and responsive layout). Reusable classes: `.card`, `.btn` (primary, secondary, danger, ghost), `.input`, `.select`, `.badge`, `.modal`, `.table`, `.skeleton`, `.toast`.
- Reusable UI components in `src/components/ui/`: Button, Input, Select, Modal, Toast (with `ToastContext` and `useToast`), Spinner, EmptyState, ConfirmDialog, plus shared SVG icons.
- Light/dark theme support with system-preference detection and `localStorage` persistence (`src/hooks/useTheme.js`).

### Changed

- Removed the scratch `scrap.ts` file that contained hardcoded Firebase keys.
- Vite build configured with vendor chunk splitting for react and firebase.

## Phase 2 — Authentication and user onboarding (2026-10-16)

### Added

- `src/services/authService.js`: `signUp(email, password, name)`, `logIn(email, password)`, `logInWithGoogle()`, `logOut()` and `resetPassword(email)`, plus profile bootstrap (`ensureUserProfile`) and category seeding (`seedDefaultCategories`).
- First sign-in bootstrap (email or Google): creates `users/{uid}/settings/profile` with `{ displayName, email, currency: "INR", createdAt }` and seeds `users/{uid}/categories` with 9 expense and 5 income default categories (`{ name, type, icon, color }`, deterministic IDs for idempotent seeding).
- `src/context/AuthContext.jsx`: `onAuthStateChanged` subscription exposing `{ user, profile, loading }`, plus its `useAuth` hook.
- Route guards in `src/components/routing/`: `ProtectedRoute` (redirects to `/login`, remembers origin) and `PublicRoute` (skips auth pages when logged in), both showing a full-page spinner while auth loads.
- Login, Signup and Forgot password pages: centered card, inline validation (valid email, 6+ character password, confirm password), Google sign-in buttons and friendly Firebase error messages via `src/utils/authErrors.js`.
- Header user menu: avatar with initials, display name, dropdown with Settings and Logout.
- `FullPageSpinner` UI component, `.form-alert` styles and auth page styles.
- Utilities: `src/utils/validation.js` (email/password checks), `src/utils/format.js` (name initials), `src/utils/constants.js` (default categories).

### Changed

- `src/services/firebase.js` validates the six `VITE_FIREBASE_*` env values, logs a clear console error when any are missing, and exports `auth`, `db` and `googleProvider`.
- Vite vendor chunking split into react, firebase, auth and firestore groups.
- Removed the placeholder avatar in the header in favor of the real user menu.

## Phase 3 — Firestore service layer (2026-10-17)

### Added

- `src/services/transactionService.js`: `addTransaction`, `updateTransaction`, `deleteTransaction`, live `subscribeToTransactions` (ordered by date desc) and `getTransactionsByRange`; validates type (income/expense), positive numeric amount, category and 300-character note.
- `src/services/categoryService.js`: live `subscribeToCategories`, `addCategory`, `updateCategory` and `deleteCategory`; deletion is blocked with a clear error when transactions still reference the category.
- `src/services/budgetService.js`: monthly budgets at `users/{uid}/budgets/{YYYY-MM}_{categoryId}` with `setBudget` (upsert), `deleteBudget` and `subscribeToBudgets(uid, month, callback)`.
- Hooks `useTransactions`, `useCategories` and `useBudgets(month)` in `src/hooks/`, each returning `{ data, loading, error }` and unsubscribing on unmount.
- Utilities: `src/utils/dateHelpers.js` (`toDate`, `startOfMonth`, `endOfMonth`, `monthKey`, `formatDate`, `getLastNMonths`), `src/utils/calc.js` (`totalIncome`, `totalExpense`, `balance`, `groupByCategory`, `groupByMonth`, `groupByDay`) and `formatCurrency(amount, currency)` in `src/utils/format.js`.
- `firestore.rules`: per-user access to `users/{uid}/**`, transaction field validation, everything else denied.
- `README.md` with setup instructions and a "Firestore rules" section for publishing the rules in the Firebase Console.

### Changed

- All Firestore queries use a single field (plus client-side filtering/sorting where needed) so no composite indexes are required.

## Phase 4 — Transactions page (2026-10-17)

### Added

- `src/pages/TransactionsPage.jsx`: full transaction management — summary cards (income, expenses, balance) computed from the fully filtered set, filter bar, paginated list, add/edit modal and delete confirmation, with loading skeletons, empty and error states.
- `src/components/transactions/TransactionFilters.jsx`: search by note/category, type and category filters (categories grouped by income/expense), date presets (this month, last month, last 3 months, this year, custom range) and client-side sorting (date/amount, both directions), plus a "Clear filters" reset.
- `src/components/transactions/TransactionList.jsx`: desktop table and mobile card layouts with category badges (seeded icon/color), signed amounts via `Intl.NumberFormat`, edit/delete actions and a shimmering `TransactionListSkeleton`.
- `src/components/transactions/TransactionModal.jsx`: shared add/edit form with expense/income segmented toggle, amount, category (grouped by type), date and note (300-character limit with counter); inline validation, inline error alert and success toasts.
- `parseDateInput` helper in `src/utils/dateHelpers.js`; `refresh()` support on `useTransactions` and `useCategories` for retrying failed subscriptions.
- New icons (Plus, Search, Edit, Trash), transaction styles (summary cards, filters, type toggle, table/cards, pagination, skeleton) and `.page-head`/`.page-subtitle` layout classes.

### Changed

- Transactions, summary cards and totals update in realtime through the existing Firestore `onSnapshot` subscription; no manual refresh after add/edit/delete.
- Filtering and sorting happen client-side over the live list (single-field Firestore queries only); the list shows 10 rows per page with Previous/Next pagination.

## Phase 5 — Settings and budgets (2026-10-17)

### Added

- Settings page (`/settings`) with Profile, Categories and Preferences tabs.
- Profile tab: avatar with initials, editable display name (validated, synced to Firebase Auth and the Firestore profile), read-only email and a logout button.
- Categories tab: expense and income category lists with add, edit and delete; add/edit modal for name, emoji and color (type locked after creation); when the service blocks a delete because the category is in use, its exact error message is shown in a toast.
- Preferences tab: currency select (INR, USD, EUR, GBP, JPY) saved to `users/{uid}/settings/profile` and applied app-wide through `formatCurrency`; light/dark theme selector saved to localStorage and applied via the `data-theme` attribute.
- Budgets page (`/budgets`): month selector with previous/next arrows and a "This month" shortcut, total budget summary card (budget, spent, remaining, overall progress), per-expense-category inline limit editing with spent and remaining amounts, progress bars that turn yellow at 80% and red above 100%, budget removal, "Copy last month's budgets" and an empty state when no budgets are set.
- `ProgressBar` UI component; new icons (ChevronLeft, ChevronRight, Copy); `getBudget` and `getBudgetsByMonth` helpers in `budgetService`; `shiftMonthKey` and `formatMonthKey` date helpers.
- `updateProfileData` in `authService` and `updateUserProfile` in `AuthContext` for validated profile updates (display name, currency).

### Changed

- `useBudgets` now exposes `refresh()`, and `useTheme` shares theme state across components through a module-level listener so the header and settings stay in sync.
- Adding an expense that crosses 80% or 100% of its category budget shows a warning toast with the new usage, based on the live transaction list and that month's budget.

## Phase 6 — Dashboard (2026-10-17)

### Added

- `src/pages/DashboardPage.jsx`: full dashboard with a month selector (previous/next arrows and a "This month" shortcut), four KPI cards (income, expenses, net balance, savings rate) with month-over-month change indicators, four charts, recent transactions and budget status.
- `src/utils/chartData.js`: pure transforms for KPIs (`buildKpis`, `percentChange`, `savingsRate`), monthly income/expense series, cumulative balance series, category spending (sorted, seeded colors with fallback palette), daily spending, budget highlights (progress tones at 80%/100%) and recent transactions.
- Dashboard components in `src/components/dashboard/`: `registerCharts` (registers only the chart.js pieces in use), `useChartTheme` (re-reads CSS variables when the theme changes), `chartOptions` (currency tooltips, compact axis ticks, legends), `ChartCard` (skeleton and empty states per chart), `KpiCard` and the IncomeExpense, BalanceTrend, CategoryDoughnut and DailyTrend charts.
- Doughnut legend labels show each category's share percentage, and legend clicks still toggle individual segments via the default chart.js behavior.
- `formatCompactCurrency` (Intl compact notation) in `src/utils/format.js`; ArrowUp/ArrowDown icons; dashboard styles in `global.css` (`.kpi-grid`, `.dashboard-grid`, chart cards, recent list, budget status) with responsive single-column layout under 768px.
- Chart.js and react-chartjs-2 are split into a dedicated `vendor-chart` build chunk.

### Changed

- Dashboard data comes from the existing live subscriptions (`useTransactions`, `useCategories`, `useBudgets(month)`) and recomputes client-side as transactions change; failures show an error card with retry, and every widget has loading and empty states.

## Phase 7 — Reports and insights (2026-10-17)

### Added

- `src/pages/ReportsPage.jsx`: entry point with a Monthly/Yearly toggle, month selector and year selector. The monthly view shows the month's summary (income, expenses, net, savings rate with month-over-month change), this month vs last month comparison chart, category breakdown table (amount, % of total, change vs last month), top 5 expenses, highest-spending day and average daily spend. The yearly view shows a 12-month income vs expense bar chart plus a month-by-month table (income, expenses, net, savings rate) with a totals row. Loading skeletons, empty and error-with-retry states are included.
- `src/utils/insights.js`: pure `generateInsights(transactions, budgets, month, currency)` returning `{ type: "warning" | "success" | "info", title, message }` objects (warnings are listed first). Rules: spending up/down more than 15% vs last month, biggest expense category and its share, categories over budget, savings rate above/below the 20% target, no income recorded this month, projected month-end spend from the daily average (warns when it exceeds the total budget), and a 3+ day no-spend streak.
- `src/components/insights/InsightCard.jsx` (`InsightCard`, `InsightCards`): colored insight cards (amber warning, green success, blue info) shown at the top of the Reports page and, capped at 3, at the top of the Dashboard.
- `src/utils/reports.js`: pure builders for the category breakdown, comparison chart series, top expenses, month day stats and the yearly report, plus `daysInMonth`, `isCurrentMonth` and `elapsedDaysInMonth` helpers in `dateHelpers.js`.
- `PeriodNav` UI component (month or year navigation with a reset shortcut), reused by the Dashboard and Reports page.
- Report styles in `global.css`: `.insights-row`, `.insight-card`, `.report-controls`, `.content-grid`/`.content-stack`, ranked top-expense list, day stat tiles and the report tables, with responsive single-column layout under 768px.

### Changed

- Shared chart infrastructure (`registerCharts`, `useChartTheme`, `chartOptions`, `ChartCard`) moved from `src/components/dashboard/` to `src/components/charts/` so both the Dashboard and Reports page use it.
- The monthly bar chart (`IncomeExpenseChart`) now accepts a `subtitle` prop and is reused for the yearly view as well.

## Phase 8 — Data export (2026-10-17)

### Added

- `src/utils/export.js`: `exportTransactionsCSV(transactions, filename)` builds a UTF-8 CSV (with a BOM so Excel opens it correctly) with Date, Type, Category, Note and Amount columns, escaping commas, quotes and newlines, and triggers a Blob download. `exportMonthlyReportPDF(reportData, month, currency)` builds a monthly PDF (jsPDF + jspdf-autotable) with a title, month, summary section, category breakdown table, transactions table and page numbers in the footer. Currency symbols are used only when the built-in font renders them ($, €, £, ¥); otherwise the currency code is used (e.g. "INR 1,200.00").
- Transactions page: "Export CSV" button exports the currently filtered rows (all pages) and is disabled when there are no results.
- Reports page (monthly view): "Download PDF" and "Export CSV" buttons for the selected month, disabled when the month has no transactions, with a loading state while the PDF is generated.
- Settings → Preferences: "Export all my data" section that downloads every transaction as a CSV file.
- New Download and FileText icons; export bar and page-head action styles with responsive layout.

### Changed

- jsPDF and jspdf-autotable are loaded on demand (dynamic import) and bundled into a dedicated `vendor-pdf` chunk, so the PDF libraries are only fetched when a report is downloaded.

## Phase 9 — Polish and hardening (2026-10-17)

### Added

- Per-page code splitting: every route is loaded with `React.lazy` and `Suspense` (spinner fallback inside the layout so the app shell stays mounted), so the initial bundle no longer ships all pages. A `NotFoundPage` (404) with a link back to the dashboard replaces the silent redirect, and `RouteTitle` keeps `document.title` in sync with the current route.
- Offline support: `useOnlineStatus` hook and a warning banner in the app layout while the browser is offline.
- Session expiry handling: `AuthProvider` exposes `sessionExpired` (set when the user loses their session without pressing Logout) and a context `logOut()` wrapper; the login page shows a "Your session expired" notice in that case.
- Demo data (Settings → Preferences): "Add demo data" seeds three months (current plus two previous) of realistic transactions marked with `isDemo: true` via `src/services/demoDataService.js` (batched writes), and "Delete demo data" removes only those samples behind a confirmation dialog.
- ESLint setup: flat `eslint.config.js` (@eslint/js, globals, react-hooks, react-refresh) and an `npm run lint` script.
- Modal accessibility: focus moves into the dialog on open, Tab is trapped inside it, and focus returns to the trigger element on close.
- Double-submit guards on the login, signup, forgot-password, profile, transaction and budget forms.

### Changed

- Contexts split for React fast refresh: `AuthContext`/`useAuth` now live in `src/context/authContext.js` (provider in `src/context/AuthProvider.jsx`), and `ToastContext`/`useToast` in `src/context/toastContext.js`; the `ui` barrel keeps the same imports for consumers.
- Filter presets and `resolveDateRange` moved out of `TransactionFilters.jsx` into `src/utils/transactionFilters.js`.
- Data hooks (`useTransactions`, `useCategories`, `useBudgets`) restructured so all state updates happen in subscription callbacks, with derived loading states (budgets show a skeleton while a new month's data arrives); `useChartTheme` and the profile/currency/budget inputs sync with external changes using the official render-time adjustment pattern instead of effects.
- `KpiCard`, `InsightCard`/`InsightCards` and `TransactionList` are wrapped in `React.memo`; removed the unused `getTransactionsByRange` service function and the `TRANSACTION_TYPES` export.
- Responsive polish: under 480px KPI cards stack to one column, chart heights shrink to 220px, page titles scale down and settings action buttons go full width.
- `firestore.rules`: transaction validation now accepts the optional boolean `isDemo` field used by demo data (re-publish the rules in the Firebase Console).

## Phase 10 — Documentation, deployment and QA (2026-10-17)

### Added

- Full `README.md`: project overview, feature list, tech stack, folder structure and data model, step-by-step Firebase setup (Email/Password + Google sign-in, Firestore, web app, `.env`, rules), local run and build instructions, a Deploy section, and a troubleshooting guide (missing env values, `permission-denied`, `auth/unauthorized-domain`, SPA 404s).
- `firebase.json` for Firebase Hosting: serves `dist/` with a single-page-app rewrite of all routes to `/index.html`.
- `vercel.json` with the same SPA rewrite for Vercel deployments, plus a "Deploy to Vercel" README section (environment variables, authorized domains). `.gitignore` now also covers `.vercel`, `.firebase/` and `firebase-debug.log*`.
- `.firebaserc.example` template for binding the Firebase project (`cp .firebaserc.example .firebaserc` or `firebase use --add`); `.firebaserc` added to `.gitignore`.
- `QA_CHECKLIST.md`: manual QA checklist covering authentication, transactions, filters, budgets, dashboard, charts, reports, exports, settings, demo data, dark mode, mobile layout (360/768/1280px), resilience and cross-cutting behaviors, plus hosting deploy commands documented in the README.

## Phase 11 — RedSpend rebrand, Obsidian Kinetic design system and public landing page (2026-10-17)

### Added

- Public landing page at `/` (`src/pages/LandingPage.jsx` + `src/components/landing/`): floating pill navigation with mobile menu, hero with an animated orbital icon field CSS-animated at three ring speeds (reduced-motion aware), a static product mock preview (KPIs, trajectory chart, categories, ledger), features, clarity-with-budget-card, three-step, auth-aware CTA and footer sections, all styled in `src/styles/landing.css` with responsive orbit scaling.
- RedSpend brand identity: `Logo`/`LogoMark` UI components (red gradient mark + wordmark), red gradient favicon, updated `index.html` metadata and the Geist typeface via Google Fonts.
- Dark "Obsidian Kinetic" token set in `global.css` (obsidian surfaces, emerald primary, coral expense tones, hairline borders, glass panels and card highlights), plus new brand/glass/input tokens; the light theme is kept as a complete variant behind the existing Settings toggle.

### Changed

- Dashboard moved from `/` to `/dashboard`; `/` is now the public landing page. `PublicRoute` redirects signed-in visitors to `/dashboard`, and in-app links, nav items, route titles and the 404 page were updated accordingly.
- Auth screens are wrapped in the branded auth shell (logo link home, frosted card) and the sidebar/header use the shared `Logo` component; buttons, cards, inputs, selects, modals and toasts were restyled on the new tokens.
- Dark is now the default theme (previously system preference); the `spendwise-theme` localStorage key is kept so saved preferences survive the rebrand.
- Branding sweep: all user-visible strings, console prefixes and export file names now use RedSpend (e.g. `redspend-report-*.csv`); report fallback chart palette and category color preview adopt the new palette.
- Landing copy advertises only shipped features (tracking, budgets, insights, PDF/CSV exports) — planned savings-goal functionality is deliberately not promised.
