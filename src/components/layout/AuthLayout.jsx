import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { RouteFallback } from "../ui";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="app-brand">
        <span className="app-brand-logo" aria-hidden="true">
          S
        </span>
        <span className="app-brand-name">SpendWise</span>
      </div>
      <div className="auth-card">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
