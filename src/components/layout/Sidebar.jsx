import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="app-brand">
        <span className="app-brand-logo" aria-hidden="true">
          S
        </span>
        <span className="app-brand-name">SpendWise</span>
      </div>
      <nav aria-label="Main navigation">
        <ul className="nav-list">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
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
