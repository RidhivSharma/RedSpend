import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { AlertTriangleIcon, RouteFallback } from "../ui";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";
import { Sidebar } from "./Sidebar";

export default function AppLayout() {
  const online = useOnlineStatus();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        {!online ? (
          <div className="offline-banner" role="status" aria-live="polite">
            <AlertTriangleIcon size={16} />
            <span>
              You are offline. Changes will not save until your connection returns.
            </span>
          </div>
        ) : null}
        <main className="page-content">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
