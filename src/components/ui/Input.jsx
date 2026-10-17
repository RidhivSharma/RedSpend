import { useId } from "react";

export function Input({ label, error, hint, id, className = "", ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`input${error ? " input-error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
