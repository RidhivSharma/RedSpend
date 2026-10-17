import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CoinsIcon,
  RefreshIcon,
  ShieldIcon,
  ZapIcon,
} from "../ui";
import { formatCurrency } from "../../utils/format";

const CHECKLIST = [
  {
    icon: ZapIcon,
    title: "Categories, your way",
    description:
      "Nine expense and five income categories out of the box — add your own icons and colors anytime.",
  },
  {
    icon: ShieldIcon,
    title: "Private by default",
    description:
      "Per-account security rules keep your ledger accessible only to you.",
  },
  {
    icon: RefreshIcon,
    title: "Always current",
    description:
      "Live Firestore sync keeps budgets and balances up to the minute.",
  },
];

const CATEGORY_BARS = [
  { name: "Food & Dining", amount: 18040, percent: 62, tone: "tone-emerald" },
  { name: "Shopping", amount: 8360, percent: 42, tone: "tone-coral" },
  { name: "Transport", amount: 6120, percent: 28, tone: "tone-sky" },
];

const STATS = [
  { label: "₹1,048 / day", caption: "Monthly run rate" },
  { label: "6.2 Months", caption: "Projected runway" },
  { label: "84.3%", caption: "Health score" },
];

export function ClaritySection() {
  return (
    <section className="rs-section" id="benefits">
      <div className="rs-container rs-clarity">
        <div className="rs-clarity-copy">
          <span className="rs-eyebrow">Clarity by default</span>
          <h2 className="rs-section-title rs-clarity-title">
            See your spending clearly. Make decisions with absolute certainty.
          </h2>
          <p className="rs-section-subtitle">
            Traditional banking apps compress your financial history into
            endless lists of rows. RedSpend transforms that data into clear,
            visual narratives — so you understand your money instantly.
          </p>

          <ul className="rs-checklist">
            {CHECKLIST.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="rs-check-item">
                  <span className="rs-check-icon">
                    <Icon size={16} />
                  </span>
                  <span className="rs-check-text">
                    <span className="rs-check-title">{item.title}</span>
                    <span className="rs-check-description">
                      {item.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <Link to="/signup" className="rs-btn rs-btn-ghost rs-clarity-cta">
            Inspect Sample Ledger
            <ArrowRightIcon size={16} />
          </Link>
        </div>

        <div className="rs-clarity-visual">
          <div className="rs-budget-card">
            <div className="rs-budget-head">
              <div>
                <span className="rs-budget-value">
                  {formatCurrency(32520, "INR")}
                </span>
                <span className="rs-budget-label">Current Month</span>
              </div>
              <span className="rs-preview-seg">
                <span className="rs-preview-seg-item">WEEKLY</span>
                <span className="rs-preview-seg-item active">OVERVIEW</span>
              </span>
            </div>

            <ul className="rs-budget-bars">
              {CATEGORY_BARS.map((category) => (
                <li key={category.name} className="rs-budget-row">
                  <span className="rs-budget-row-head">
                    <span className="rs-budget-row-name">
                      <CoinsIcon size={14} />
                      {category.name}
                    </span>
                    <span className="rs-budget-row-amount">
                      {formatCurrency(category.amount, "INR")}
                    </span>
                  </span>
                  <span className="rs-budget-bar" aria-hidden="true">
                    <span
                      className={`rs-budget-bar-fill ${category.tone}`}
                      style={{ width: `${category.percent}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>

            <div className="rs-budget-stats">
              {STATS.map((stat) => (
                <div key={stat.caption} className="rs-budget-stat">
                  <span className="rs-budget-stat-value">{stat.label}</span>
                  <span className="rs-budget-stat-caption">{stat.caption}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
