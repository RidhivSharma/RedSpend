# SpendWise QA Checklist

Manual QA checklist for the SpendWise app. Run `npm run dev`, log in with a test account (or create one), and work through the sections below. Check off each item as it passes and note any failures with a short description.

- [ ] Environment ready: `.env` filled, `npm run dev` starts without console errors

## Setup and authentication

- [ ] Signed-out visitors hitting `/`, `/transactions`, `/budgets`, `/reports`, `/settings` are redirected to `/login`
- [ ] Signed-in users hitting `/login`, `/signup` or `/forgot-password` are redirected into the app
- [ ] Signup validates: required name, valid email, password 6+ characters, matching confirm password
- [ ] Signup creates the account, seeds the default categories and lands on the Dashboard
- [ ] Signup with an already-used email shows a friendly error (not a raw Firebase error)
- [ ] Login with wrong credentials shows a friendly error and does not crash
- [ ] Login with correct credentials lands on the Dashboard (or the originally requested page)
- [ ] "Continue with Google" signs in and prompts the Google account chooser
- [ ] Signup/login buttons show a loading state and cannot be double-submitted (fast double-click sends one request)
- [ ] Forgot password: invalid email is rejected; valid email shows the "check your inbox" confirmation
- [ ] Logout from the header user menu and from Settings works and returns to `/login`
- [ ] After logout, browser back button does not reveal protected pages
- [ ] If the session expires (revoke/expire the token or sign out from another tab), the login page shows "Your session expired" instead of silent failure
- [ ] Visiting an unknown URL shows the 404 page with a working "Back to dashboard" link
- [ ] Browser tab title updates per page (e.g. "Dashboard · SpendWise", "Page not found · SpendWise")

## Transactions

- [ ] Add an expense: type toggle, amount, category, date and note all save; success toast appears and the row appears without a page reload
- [ ] Add an income: amount is shown with a "+" and income styling
- [ ] Validation: empty amount, `0`, negative, non-numeric and missing category/date all show inline errors and do not save
- [ ] Note longer than 300 characters is prevented and the character counter updates
- [ ] Editing a transaction pre-fills all fields and saving updates it live
- [ ] Delete asks for confirmation; cancelling keeps the transaction, confirming removes it with a toast
- [ ] Summary cards (income, expenses, balance) update with every add/edit/delete
- [ ] Search filters by note and by category name as you type
- [ ] Type filter (all/income/expense), category filter and date presets (this month, last month, last 3 months, this year) all return correct rows
- [ ] Custom date range works, and start > end shows the inline warning
- [ ] Sorting (newest, oldest, highest, lowest amount) reorders the list correctly
- [ ] "Clear filters" resets everything back to defaults
- [ ] Pagination: next/previous change pages, page count is correct, and filters apply across all pages
- [ ] Empty states: no transactions at all vs. no results for the current filter are handled differently and clearly
- [ ] "Export CSV" downloads the filtered rows (all pages) and opens correctly in Excel/Sheets
- [ ] Mobile view (under 768px) shows transaction cards instead of the table, with working edit/delete buttons

## Budgets

- [ ] Setting a limit for a category saves on blur/Enter; the input shows a loading state while saving
- [ ] Invalid limits ("0", negative, text) show an inline error and do not save
- [ ] Progress bar turns amber at 80% and red above 100%
- [ ] "Remaining" shows the correct amount and switches to "over" with expense styling when exceeded
- [ ] Removing a budget asks for confirmation (or removes cleanly) and the "No budget set" hint returns
- [ ] "Copy last month's budgets" copies correctly and is disabled/absent when last month has none
- [ ] Summary card (total budget, spent, remaining, overall progress) matches the row values
- [ ] Adding an expense that crosses 80% / 100% of its category budget shows the warning toast with the new usage
- [ ] Month navigation (prev/next arrows and "This month") reloads the correct month's budgets and spending
- [ ] Empty state appears when no budgets are set for the month

## Dashboard

- [ ] KPI cards show income, expenses, net balance and savings rate for the selected month with correct month-over-month arrows
- [ ] All four charts render (income vs expense, balance trend, category doughnut, daily spending) with correct data
- [ ] Category doughnut legend shows each category's share percentage; clicking a legend item toggles/hides it
- [ ] Chart tooltips show currency-formatted values (respecting the Settings currency)
- [ ] Month navigation updates KPIs, charts, insights, recent transactions and budget status together
- [ ] Insight cards (max 3) match the current month's data and use the right tones (amber/green/blue)
- [ ] Recent transactions list shows the latest entries and links/behaves as expected
- [ ] Budget status card matches the Budgets page for the same month
- [ ] Empty month (no transactions) shows friendly empty states instead of broken charts
- [ ] Loading skeletons appear briefly on first load / month switch

## Reports

- [ ] Monthly/Yearly toggle switches views correctly
- [ ] Monthly: summary values (income, expenses, net, savings rate with change vs last month) are correct
- [ ] Monthly: comparison chart, category breakdown (amount, % of total, change), top expenses, highest day and daily average are correct
- [ ] Yearly: 12-month chart and table are complete, with a correct totals row; future months show empty periods sensibly
- [ ] Month/year navigation updates every widget
- [ ] "Download PDF" produces a readable PDF (summary, category table, transactions, page numbers) and the button shows a loading state while generating
- [ ] "Export CSV" exports the selected month's transactions
- [ ] Export buttons are disabled when the selected period has no transactions
- [ ] Empty and error-with-retry states behave correctly (retry works after reconnecting)

## Settings

- [ ] Profile: display name saves, validation blocks empty/60+ character names, header avatar/name update immediately
- [ ] Categories: add a new expense and income category with name, emoji and color; it appears in the correct list and in transaction dropdowns
- [ ] Categories: editing a category updates its name/icon/color in existing transaction rows
- [ ] Categories: deleting a category with no transactions works; deleting an in-use category is blocked with a clear message
- [ ] Currency: changing it updates every amount app-wide immediately and persists after reload
- [ ] Theme: light/dark selector switches instantly and persists after reload
- [ ] "Export all my data" downloads every transaction as a CSV
- [ ] Demo data: "Add demo data" creates ~3 months of sample transactions and the count updates in the card
- [ ] Demo data: "Delete demo data" asks for confirmation and removes only the demo rows (your own transactions remain)
- [ ] Demo delete button is disabled when no demo data exists

## Dark mode

- [ ] Header toggle switches themes on every page (Dashboard, Transactions, Budgets, Reports, Settings, auth pages)
- [ ] Theme choice persists across reloads and new tabs
- [ ] Charts re-render with theme-correct colors (axes, grid, tooltips, datasets) right after toggling
- [ ] Text contrast is readable on cards, tables, modals, toasts, insights and the offline banner in dark mode

## Mobile layout (test at 360px, 768px and 1280px)

- [ ] 360px: bottom tab bar replaces the sidebar; all 5 tabs work; content is not cut off by the tab bar
- [ ] 360px: KPI cards stack to one column and money values are not clipped
- [ ] 360px: tables switch to cards (transactions, reports), charts shrink but stay readable, modals fit the screen with scrollable bodies
- [ ] 360px: settings action buttons go full width and are easy to tap
- [ ] 768px: layout transition between mobile and desktop is clean (no overlapping elements)
- [ ] 1280px: sidebar, header and two-column grids render correctly with no horizontal scrolling
- [ ] Filter bars, export bars and pagination wrap sensibly instead of overflowing
- [ ] No horizontal page scroll at any of the three widths

## Resilience and cross-cutting

- [ ] Offline banner appears when the network is disabled and disappears when it returns
- [ ] Attempting to save while offline shows a friendly error (user-visible) rather than a silent failure
- [ ] All modals: Esc closes, focus moves inside on open, Tab stays trapped inside, closing returns focus to the trigger
- [ ] Enter submits forms (transaction modal footer button, auth forms, budget inputs)
- [ ] Toasts are readable, dismissible and auto-dismiss
- [ ] Every destructive action (delete transaction, delete category, delete demo data) asks for confirmation
- [ ] Page refresh (F5) on any route keeps you on that route when signed in
