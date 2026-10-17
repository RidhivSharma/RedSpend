import { useId } from "react";

export function Select({
  label,
  error,
  hint,
  id,
  options = [],
  placeholder,
  children,
  className = "",
  ...rest
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label className="field-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`select${error ? " select-error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children ??
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
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
