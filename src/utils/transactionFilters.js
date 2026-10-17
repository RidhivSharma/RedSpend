import { endOfMonth, parseDateInput, startOfMonth } from "./dateHelpers";

export const DATE_PRESETS = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
  { value: "this-year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
];

export const DEFAULT_FILTERS = {
  type: "all",
  categoryId: "all",
  preset: "this-month",
  startDate: "",
  endDate: "",
  search: "",
  sort: "date-desc",
};

export function resolveDateRange(filters, now = new Date()) {
  switch (filters.preset) {
    case "last-month": {
      const base = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(base), end: endOfMonth(base) };
    }
    case "last-3-months":
      return {
        start: startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
        end: endOfMonth(now),
      };
    case "this-year":
      return {
        start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case "custom": {
      const start = parseDateInput(filters.startDate);
      const end = parseDateInput(filters.endDate);
      if (end) end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "this-month":
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}
