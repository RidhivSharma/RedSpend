import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_TITLES } from "../layout/navItems";

const AUTH_TITLES = {
  "/login": "Log in",
  "/signup": "Sign up",
  "/forgot-password": "Reset password",
};

const LANDING_TITLE = "RedSpend — Take control of where your money goes";

export default function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title =
      pathname === "/" ? LANDING_TITLE : PAGE_TITLES[pathname] ?? AUTH_TITLES[pathname];
    document.title = title ? `${title} · RedSpend` : "Page not found · RedSpend";
  }, [pathname]);

  return null;
}
