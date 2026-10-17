import { ChartIcon, ReceiptIcon, TrendingUpIcon } from "../ui";

const STEPS = [
  {
    number: "1",
    icon: ReceiptIcon,
    title: "Track",
    description:
      "Log expenses and income in seconds. Pick a category, add a note, and every record stays flawless from the start.",
  },
  {
    number: "2",
    icon: ChartIcon,
    title: "Understand",
    description:
      "Review live category insights and trend lines to uncover exactly where your money flows.",
  },
  {
    number: "3",
    icon: TrendingUpIcon,
    title: "Improve",
    description:
      "Set monthly budget targets, watch your savings rate, and improve month after month.",
  },
];

export function StepsSection() {
  return (
    <section className="rs-section" id="how-it-works">
      <div className="rs-container">
        <div className="rs-section-head">
          <span className="rs-eyebrow rs-eyebrow-pill">Implement in seconds</span>
          <h2 className="rs-section-title">
            Better money habits start with three simple steps.
          </h2>
          <p className="rs-section-subtitle">
            No tedious setup or lengthy onboarding queues. Begin tracking your
            money in under 60 seconds.
          </p>
        </div>

        <ol className="rs-steps">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="rs-step">
                <span className="rs-step-number" aria-hidden="true">
                  {step.number}
                </span>
                <span className="rs-step-icon">
                  <Icon size={18} />
                </span>
                <h3 className="rs-step-title">{step.title}</h3>
                <p className="rs-step-description">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
