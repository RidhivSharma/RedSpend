import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";

function readChartColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

  return {
    text: read("--text", "#0f172a"),
    muted: read("--text-muted", "#64748b"),
    grid: read("--border", "#e2e8f0"),
    surface: read("--surface", "#ffffff"),
    income: read("--color-income", "#16a34a"),
    expense: read("--color-expense", "#dc2626"),
    primary: read("--color-primary", "#4f46e5"),
    info: read("--color-info", "#0284c7"),
  };
}

export function useChartTheme() {
  const { theme } = useTheme();
  const [colors, setColors] = useState(readChartColors);
  const [syncedTheme, setSyncedTheme] = useState(theme);

  if (theme !== syncedTheme) {
    setSyncedTheme(theme);
    setColors(readChartColors());
  }

  return colors;
}
