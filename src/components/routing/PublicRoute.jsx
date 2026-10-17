import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { FullPageSpinner } from "../ui";

export default function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (user) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from ?? "/"} replace />;
  }

  return <Outlet />;
}
