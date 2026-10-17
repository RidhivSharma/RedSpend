import { useId } from "react";

export function LogoMark({ size = 32, className = "", ...rest }) {
  const gradientId = useId();
  const classes = ["logo-mark", className].filter(Boolean).join(" ");

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="RedSpend"
      focusable="false"
      {...rest}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A80" />
          <stop offset="1" stopColor="#E5484D" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="17" fill={`url(#${gradientId})`} />
      <text
        x="32"
        y="45.5"
        fontFamily="Geist, Arial, Helvetica, sans-serif"
        fontSize="36"
        fontWeight="700"
        fill="#ffffff"
        textAnchor="middle"
      >
        R
      </text>
    </svg>
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
