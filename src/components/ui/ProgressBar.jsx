export function ProgressBar({
  value = 0,
  max = 100,
  tone = "primary",
  label,
  className = "",
}) {
  const safeMax = Number(max) > 0 ? Number(max) : 0;
  const numberValue = Number(value);
  const safeValue = Number.isFinite(numberValue) ? numberValue : 0;
  const percent = safeMax > 0 ? Math.min((safeValue / safeMax) * 100, 100) : 0;
  const classes = ["progress", `progress-${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label}
    >
      <span className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
