export function LogoMark({ size = 32, className = "", ...rest }) {
  const classes = ["logo-mark", className].filter(Boolean).join(" ");

  return (
    <img
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={classes}
      draggable="false"
      {...rest}
    />
  );
}

export function Logo({ size = 32, showWordmark = true, wordmark = "RedSpend" }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      {showWordmark ? <span className="logo-wordmark">{wordmark}</span> : null}
    </span>
  );
}
