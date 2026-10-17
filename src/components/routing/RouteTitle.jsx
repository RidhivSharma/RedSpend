import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_TITLES } from "../layout/navItems";

const AUTH_TITLES = {
  "/login": "Log in",
  "/signup": "Sign up",
  "/forgot-password": "Reset password",
};

export default function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[pathname] ?? AUTH_TITLES[pathname];
    document.title = title ? `${title} · SpendWise` : "Page not found · SpendWise";
  }, [pathname]);

  return null;
}
