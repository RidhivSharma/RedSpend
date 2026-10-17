export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function parseDateInput(value) {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function startOfMonth(date = new Date()) {
  const value = toDate(date) ?? new Date();
  return new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date = new Date()) {
  const value = toDate(date) ?? new Date();
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function monthKey(date = new Date()) {
  const value = toDate(date) ?? new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function shiftMonthKey(key, delta) {
  const [year, month] = String(key).split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error("A valid month key (YYYY-MM) is required.");
  }
  return monthKey(new Date(year, month - 1 + Number(delta || 0), 1));
}

export function formatMonthKey(key) {
  const [year, month] = String(key).split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  if (Number.isNaN(date.getTime())) return String(key);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function daysInMonth(month) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(monthNumber)) return 0;
  return new Date(year, monthNumber, 0).getDate();
}

export function isCurrentMonth(month) {
  return month === monthKey(new Date());
}

export function elapsedDaysInMonth(month) {
  const total = daysInMonth(month);
  if (total === 0) return 0;
  const currentKey = monthKey(new Date());
  if (month === currentKey) return Math.min(new Date().getDate(), total);
  return String(month) < currentKey ? total : 0;
}

export function getLastNMonths(count = 6, from = new Date()) {
  const total = Number.isFinite(count) && count > 0 ? Math.floor(count) : 6;
  const base = toDate(from) ?? new Date();
  const months = [];

  for (let index = total - 1; index >= 0; index -= 1) {
    months.push(monthKey(new Date(base.getFullYear(), base.getMonth() - index, 1)));
  }

  return months;
}
