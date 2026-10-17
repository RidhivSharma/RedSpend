import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spendwise-theme";
const listeners = new Set();

function readStoredTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((listener) => listener(theme));
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", readStoredTheme());
    const listener = (nextTheme) => setThemeState(nextTheme);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setTheme = useCallback((nextTheme) => {
    applyTheme(nextTheme === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(readStoredTheme() === "dark" ? "light" : "dark");
  }, []);

  return { theme, toggleTheme, setTheme };
}
