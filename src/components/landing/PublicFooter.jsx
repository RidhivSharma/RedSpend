import { Link } from "react-router-dom";
import { Logo } from "../ui";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#benefits", label: "Benefits" },
];

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="rs-footer">
      <div className="rs-container rs-footer-inner">
        <Link to="/" className="rs-footer-brand" aria-label="RedSpend home">
          <Logo size={28} />
        </Link>

        <nav aria-label="Footer">
          <ul className="rs-footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a className="rs-footer-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="rs-footer-copy">
          © {year} RedSpend Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
