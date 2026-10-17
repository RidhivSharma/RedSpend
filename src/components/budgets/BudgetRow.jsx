import { useState } from "react";
import { ProgressBar, TrashIcon } from "../ui";
import { formatCurrency } from "../../utils/format";

const FALLBACK_ICON = "🏷️";
const FALLBACK_COLOR = "#64748b";

function budgetTone(spent, limit) {
  const safeLimit = Number(limit);
  if (!Number.isFinite(safeLimit) || safeLimit <= 0) return "primary";
  const percent = (Number(spent) / safeLimit) * 100;
  if (percent > 100) return "danger";
  if (percent >= 80) return "warning";
  return "primary";
}

export function BudgetRow({
  category,
  budget = null,
  spent = 0,
  currency = "INR",
  onSave,
  onRemove,
}) {
  const storedValue = budget ? String(budget.limit) : "";
  const limitKey = `${budget?.id ?? ""}:${budget?.limit ?? ""}`;
  const [value, setValue] = useState(storedValue);
  const [syncedLimit, setSyncedLimit] = useState(limitKey);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (limitKey !== syncedLimit) {
    setSyncedLimit(limitKey);
    setValue(storedValue);
    setError("");
  }

  const commit = async () => {
    if (saving) return;
    const stored = budget?.limit ?? null;
    const trimmed = value.trim();

    if (!trimmed) {
      setValue(stored !== null ? String(stored) : "");
      setError("");
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    if (stored !== null && parsed === stored) {
      setValue(String(stored));
      setError("");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(category, parsed);
    } catch (saveError) {
      console.error("[SpendWise] Failed to save budget:", saveError);
      setError(
        saveError?.code
          ? "Could not save the budget. Check your connection and try again."
          : saveError?.message || "Could not save the budget."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setValue(budget ? String(budget.limit) : "");
      setError("");
      event.currentTarget.blur();
    }
  };

  const tone = budgetTone(spent, budget?.limit);
  const remaining = budget
    ? Math.round((Number(budget.limit) - Number(spent)) * 100) / 100
    : null;
  const color = category.color || FALLBACK_COLOR;

  return (
    <li className="budget-row">
      <div className="budget-row-info">
        <span className="category-badge">
          <span
            className="category-badge-icon"
            style={{ backgroundColor: `${color}1f`, color }}
            aria-hidden="true"
          >
            {category.icon || FALLBACK_ICON}
          </span>
          <span className="category-badge-name">{category.name}</span>
        </span>
        <span className="budget-row-stats">
          {budget
            ? `Spent ${formatCurrency(spent, currency)} of ${formatCurrency(
                budget.limit,
                currency
              )}`
            : "No budget set"}
        </span>
      </div>

      <div className="budget-row-progress">
        {budget ? (
          <>
            <ProgressBar
              value={spent}
              max={budget.limit}
              tone={tone}
              label={`${category.name} budget usage`}
            />
            <span
              className={`budget-remaining${
                remaining < 0 ? " text-expense" : ""
              }`}
            >
              {remaining < 0
                ? `${formatCurrency(Math.abs(remaining), currency)} over`
                : `${formatCurrency(remaining, currency)} left`}
            </span>
          </>
        ) : (
          <span className="budget-row-hint">Set a limit to track this category.</span>
        )}
      </div>

      <div className="budget-row-controls">
        <span className="budget-currency-label">{currency}</span>
        <input
          type="number"
          className={`input budget-input${error ? " input-error" : ""}`}
          min="0.01"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          disabled={saving}
          aria-label={`Monthly budget for ${category.name}`}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
        {budget ? (
          <button
            type="button"
            className="icon-btn icon-btn-sm icon-btn-danger"
            onClick={() => onRemove(category, budget)}
            aria-label={`Remove ${category.name} budget`}
          >
            <TrashIcon size={16} />
          </button>
        ) : null}
      </div>

      {error ? <p className="field-error budget-row-error">{error}</p> : null}
    </li>
  );
}
