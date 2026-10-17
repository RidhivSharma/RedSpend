import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicRoute from "./components/routing/PublicRoute";
import RouteTitle from "./components/routing/RouteTitle";

const BudgetsPage = lazy(() => import("./pages/BudgetsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));

export default function App() {
  return (
    <>
      <RouteTitle />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
