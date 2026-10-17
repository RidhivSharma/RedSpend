import { Link } from "react-router-dom";
import { ArrowRightIcon, LockIcon } from "../ui";
import { DashboardPreview } from "./DashboardPreview";
import { OrbitField } from "./OrbitField";

export function HeroSection() {
  return (
    <section className="rs-hero">
      <OrbitField />

      <div className="rs-container rs-hero-content">
        <span className="rs-pill rs-hero-badge">
          <LockIcon size={12} />
          Secure, private, real-time
        </span>

        <h1 className="rs-hero-title">
          Take control of where your <span className="rs-accent">money goes.</span>
        </h1>

        <p className="rs-hero-subtitle">
          Track expenses, understand your spending habits, and build better
          financial discipline — all in one beautifully simple place.
        </p>

        <div className="rs-hero-actions">
          <Link to="/signup" className="rs-btn rs-btn-primary">
            Start Tracking Now
            <ArrowRightIcon size={17} />
          </Link>
          <a href="#features" className="rs-btn rs-btn-ghost">
            Explore Features
          </a>
        </div>

        <p className="rs-hero-note">
          Free to start · No credit card required · Built for everyday money
        </p>

        <DashboardPreview />
      </div>
    </section>
  );
}
