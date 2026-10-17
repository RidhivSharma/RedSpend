import { ChartIcon, HomeIcon, ReceiptIcon, SettingsIcon, TargetIcon } from "../ui/Icons";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/transactions", label: "Transactions", icon: ReceiptIcon },
  { to: "/budgets", label: "Budgets", icon: TargetIcon },
  { to: "/reports", label: "Reports", icon: ChartIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export const PAGE_TITLES = Object.fromEntries(
  NAV_ITEMS.map(({ to, label }) => [to, label])
);
