import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useTheme } from "../../hooks/useTheme";
import { getInitials } from "../../utils/format";
import {
  ChevronDownIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  Spinner,
  SunIcon,
  useToast,
} from "../ui";
import { PAGE_TITLES } from "./navItems";

export function Header() {
  const { pathname } = useLocation();
  const { user, profile, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  const title = PAGE_TITLES[pathname] ?? "SpendWise";
  const displayName = profile?.displayName || user?.displayName || user?.email || "User";

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setLoggingOut(true);
    try {
      await logOut();
      toast.success("You have been logged out.");
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="app-header">
      <h1 className="app-header-title">{title}</h1>
      <div className="app-header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
        </button>
        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="user-menu-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            <span className="avatar" aria-hidden="true">
              {getInitials(displayName)}
            </span>
            <span className="user-menu-name">{displayName}</span>
            <ChevronDownIcon size={16} className="user-menu-caret" />
          </button>

          {menuOpen ? (
            <div className="user-menu-dropdown" role="menu">
              <div className="user-menu-header">
                <span className="user-menu-header-name">{displayName}</span>
                {user?.email ? (
                  <span className="user-menu-header-email">{user.email}</span>
                ) : null}
              </div>
              <Link
                to="/settings"
                className="user-menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <SettingsIcon size={18} />
                <span>Settings</span>
              </Link>
              <button
                type="button"
                className="user-menu-item user-menu-item-danger"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? <Spinner size={16} /> : <LogOutIcon size={18} />}
                <span>{loggingOut ? "Logging out…" : "Logout"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
