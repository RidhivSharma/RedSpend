import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { ArrowRightIcon, CloseIcon, Logo, MenuIcon } from "../ui";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#benefits", label: "Benefits" },
];

export function PublicNav() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="rs-nav-wrap">
      <nav className="rs-nav" aria-label="Primary">
        <Link to="/" className="rs-nav-brand" aria-label="RedSpend home">
          <Logo size={30} />
        </Link>

        <ul className="rs-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a className="rs-nav-link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="rs-nav-actions">
          {user ? (
            <Link to="/dashboard" className="rs-nav-cta">
              Open Dashboard
              <ArrowRightIcon size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="rs-nav-link rs-nav-login">
                Log In
              </Link>
              <Link to="/signup" className="rs-nav-cta">
                Sign Up
                <ArrowRightIcon size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rs-nav-toggle icon-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </nav>

      {menuOpen ? (
        <div className="rs-nav-panel">
          <ul className="rs-nav-panel-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className="rs-nav-link" href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {user ? (
            <Link to="/dashboard" className="rs-nav-cta" onClick={closeMenu}>
              Open Dashboard
              <ArrowRightIcon size={16} />
            </Link>
          ) : (
            <div className="rs-nav-panel-actions">
              <Link
                to="/login"
                className="rs-nav-cta rs-nav-cta-ghost"
                onClick={closeMenu}
              >
                Log In
              </Link>
              <Link to="/signup" className="rs-nav-cta" onClick={closeMenu}>
                Sign Up
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
