import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export function MobileTabBar() {
  return (
    <nav className="mobile-tabbar" aria-label="Primary">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
