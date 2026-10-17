import { NavLink, Link } from "react-router-dom";
import { Logo } from "../ui";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <Link to="/dashboard" className="app-brand-link" aria-label="RedSpend dashboard">
        <Logo size={32} />
      </Link>
      <nav aria-label="Main navigation">
        <ul className="nav-list">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
