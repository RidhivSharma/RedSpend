import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  FileTextIcon,
  ScanIcon,
  SlidersIcon,
  TrendingUpIcon,
} from "../ui";

const FEATURES = [
  {
    id: "tracking",
    icon: ScanIcon,
    tone: "emerald",
    title: "Automated Expense Tracking",
    description:
      "Categorize every transaction the moment it is logged, with live totals, search, flexible filters and signed amounts that keep every rupee accounted for.",
    linkLabel: "See tracking features",
  },
  {
    id: "budgets",
    icon: SlidersIcon,
    tone: "sky",
    title: "Dynamic Smart Budgets",
    description:
      "Set monthly category limits and edit them inline as your flow changes. Progress bars warn you when you reach 80% — before you overspend.",
    linkLabel: "Learn about budgeting",
  },
  {
    id: "insights",
    icon: TrendingUpIcon,
    tone: "violet",
    title: "Visual Spending Insights",
    description:
      "Understand exactly where money went with monthly and yearly charts, category breakdowns and plain-language insight cards that flag unusual spending.",
    linkLabel: "Explore analytics",
  },
  {
    id: "reports",
    icon: FileTextIcon,
    tone: "coral",
    title: "One-Click Reports & Exports",
    description:
      "Generate polished monthly PDF reports and export any filtered view to CSV in seconds — ready to archive, share or hand to your accountant.",
    linkLabel: "Explore reports",
  },
];

export function FeatureSection() {
  return (
    <section className="rs-section" id="features">
      <div className="rs-container">
        <div className="rs-section-head">
          <span className="rs-eyebrow rs-eyebrow-pill">Key Features</span>
          <h2 className="rs-section-title">
            Everything you need to understand your spending.
          </h2>
          <p className="rs-section-subtitle">
            No complicated spreadsheets or rigid accounting tools. RedSpend
            organizes every single transaction with effortless intelligence.
          </p>
        </div>

        <div className="rs-feature-grid">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.id} className="rs-feature-card">
                <span className={`rs-feature-icon rs-feature-icon-${feature.tone}`}>
                  <Icon size={20} />
                </span>
                <h3 className="rs-feature-title">{feature.title}</h3>
                <p className="rs-feature-description">{feature.description}</p>
                <Link to="/signup" className="rs-feature-link">
                  {feature.linkLabel}
                  <ArrowRightIcon size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
