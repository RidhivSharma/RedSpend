export function Spinner({ size = 20, className = "", ...rest }) {
  const classes = ["spinner", className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 8)) }}
      role="status"
      aria-label="Loading"
      {...rest}
    />
  );
}
