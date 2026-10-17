import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { ArrowRightIcon, Logo, RouteFallback } from "../ui";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <Link to="/" className="auth-brand-link" aria-label="RedSpend home">
        <Logo size={36} />
      </Link>
      <div className="auth-card">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <Link to="/" className="auth-home-link">
        Back to home
        <ArrowRightIcon size={14} />
      </Link>
    </div>
  );
}
