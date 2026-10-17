import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export function PeriodNav({
  label,
  onPrevious,
  onNext,
  onReset,
  resetLabel = "This month",
  previousLabel = "Previous month",
  nextLabel = "Next month",
  className = "",
}) {
  return (
    <div
      className={`month-nav ${className}`.trim()}
      role="group"
      aria-label={`${previousLabel} / ${nextLabel}`}
    >
      <button
        type="button"
        className="icon-btn"
        onClick={onPrevious}
        aria-label={previousLabel}
      >
        <ChevronLeftIcon size={18} />
      </button>
      <span className="month-nav-label">{label}</span>
      <button
        type="button"
        className="icon-btn"
        onClick={onNext}
        aria-label={nextLabel}
      >
        <ChevronRightIcon size={18} />
      </button>
      {onReset ? (
        <Button variant="ghost" size="sm" onClick={onReset}>
          {resetLabel}
        </Button>
      ) : null}
    </div>
  );
}
