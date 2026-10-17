import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldIcon } from "../ui";
import { useAuth } from "../../context/authContext";

export function CtaSection() {
  const { user } = useAuth();

  return (
    <section className="rs-section" id="get-started">
      <div className="rs-container">
        <div className="rs-cta">
          <span className="rs-eyebrow rs-eyebrow-pill">
            RedSpend Wealth Management
          </span>
          <h2 className="rs-cta-title">Make every rupee count.</h2>
          <p className="rs-cta-subtitle">
            Start understanding your spending and take more informed financial
            decisions today. Free to start — no credit card required.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="rs-btn rs-btn-primary rs-btn-lg"
          >
            {user ? "Open your dashboard" : "Create my account"}
            <ArrowRightIcon size={17} />
          </Link>
          <p className="rs-cta-note">
            <ShieldIcon size={14} />
            Secure by design — your data stays yours.
          </p>
        </div>
      </div>
    </section>
  );
}
