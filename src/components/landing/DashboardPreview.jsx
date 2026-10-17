import { useId } from "react";
import { formatCurrency } from "../../utils/format";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ReceiptIcon,
} from "../ui";

const KPIS = [
  {
    label: "Total Balance",
    value: 84250,
    delta: "+2.4%",
    direction: "up",
    tone: "good",
    note: "2 accounts",
  },
  {
    label: "Monthly Income",
    value: 65000,
    delta: "+4.1%",
    direction: "up",
    tone: "good",
    note: "October",
  },
  {
    label: "Monthly Spend",
    value: 32480,
    delta: "−2.3%",
    direction: "down",
    tone: "bad",
    note: "vs last month",
  },
  {
    label: "Net Savings",
    value: 32520,
    delta: "+8.1%",
    direction: "up",
    tone: "good",
    note: "50% of income",
  },
];

const CATEGORIES = [
  { name: "Food & Drinks", amount: 8240, percent: 37, tone: "tone-emerald" },
  { name: "Shopping", amount: 4890, percent: 24, tone: "tone-violet" },
  { name: "Transport", amount: 6120, percent: 16, tone: "tone-sky" },
  { name: "Utilities", amount: 3240, percent: 12, tone: "tone-amber" },
];

const LEDGER = [
  {
    icon: "🛒",
    name: "Nature's Basket Grocery",
    meta: "Today · Food & Dining",
    amount: -1458,
    method: "CASH",
  },
  {
    icon: "💻",
    name: "Freelance UI Contract Settlement",
    meta: "Oct 26 · Freelance",
    amount: 15000,
    method: "BANK",
  },
  {
    icon: "⚡",
    name: "State Electricity Bill",
    meta: "Oct 24 · Utilities",
    amount: -2340,
    method: "CARD",
  },
];

function TrajectoryChart() {
  const gradientId = useId();
  const areaId = useId();

  return (
    <svg
      className="rs-preview-chart"
      viewBox="0 0 620 220"
      role="img"
      aria-label="Spending trajectory preview chart"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#36d399" stopOpacity="0.28" />
          <stop offset="1" stopColor="#36d399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={areaId} x1="30" y1="0" x2="590" y2="0">
          <stop offset="0" stopColor="#36d399" />
          <stop offset="1" stopColor="#7bd0ff" />
        </linearGradient>
      </defs>

      {[20, 80, 140, 200].map((y) => (
        <line
          key={y}
          x1="30"
          y1={y}
          x2="590"
          y2={y}
          className="rs-preview-gridline"
        />
      ))}

      <path
        d="M30 160 Q 100 152 160 128 T 300 96 T 430 78 T 590 46 L 590 206 L 30 206 Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M30 160 Q 100 152 160 128 T 300 96 T 430 78 T 590 46"
        className="rs-preview-line-income"
      />
      <path
        d="M30 186 Q 120 180 200 168 T 380 150 T 590 128"
        className="rs-preview-line-expense"
      />

      <line x1="430" y1="78" x2="430" y2="206" className="rs-preview-pin-line" />
      <circle cx="430" cy="78" r="5" className="rs-preview-pin" />
      <circle cx="590" cy="46" r="4" fill={`url(#${areaId})`} />
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <div className="rs-preview-wrap">
      <div className="rs-preview">
        <div className="rs-preview-bar">
          <span className="rs-preview-dots" aria-hidden="true">
            <i className="rs-preview-dot rs-preview-dot-red" />
            <i className="rs-preview-dot rs-preview-dot-amber" />
            <i className="rs-preview-dot rs-preview-dot-green" />
          </span>
          <span className="rs-preview-title">Overview Dashboard</span>
          <span className="rs-preview-sync">
            <span className="rs-preview-sync-dot" aria-hidden="true" />
            LIVE SYNC
          </span>
          <span className="rs-preview-range">
            <CalendarIcon size={13} />
            Oct 01 – 31, 2025
          </span>
        </div>

        <div className="rs-preview-body">
          <div className="rs-preview-kpis">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rs-preview-kpi">
                <span className="rs-preview-kpi-label">{kpi.label}</span>
                <span className="rs-preview-kpi-value">
                  {formatCurrency(kpi.value, "INR")}
                </span>
                <span className="rs-preview-kpi-meta">
                  <span className={`rs-preview-delta ${kpi.tone}`}>
                    {kpi.direction === "up" ? (
                      <ArrowUpIcon size={12} />
                    ) : (
                      <ArrowDownIcon size={12} />
                    )}
                    {kpi.delta}
                  </span>
                  <span className="rs-preview-kpi-note">{kpi.note}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="rs-preview-grid">
            <div className="rs-preview-panel">
              <div className="rs-preview-panel-head">
                <div>
                  <span className="rs-preview-panel-title">
                    Spending Trajectory
                  </span>
                  <span className="rs-preview-legend">
                    <i className="rs-preview-legend-dot tone-emerald" />
                    Income
                    <i className="rs-preview-legend-dot tone-coral" />
                    Expense
                  </span>
                </div>
                <span className="rs-preview-seg">
                  <span className="rs-preview-seg-item active">CHART</span>
                  <span className="rs-preview-seg-item">GRID</span>
                </span>
              </div>
              <div className="rs-preview-chart-wrap">
                <span className="rs-preview-axis">₹1.0L</span>
                <span className="rs-preview-axis rs-preview-axis-mid">₹50K</span>
                <span className="rs-preview-axis rs-preview-axis-zero">₹0</span>
                <TrajectoryChart />
              </div>
              <div className="rs-preview-chart-dates">
                <span>Oct 01</span>
                <span>Oct 15</span>
                <span>Oct 24</span>
                <span>Oct 31</span>
              </div>
            </div>

            <div className="rs-preview-panel">
              <div className="rs-preview-panel-head">
                <span className="rs-preview-panel-title">Active Categories</span>
                <span className="rs-preview-panel-badge">OCTOBER</span>
              </div>
              <ul className="rs-preview-cats">
                {CATEGORIES.map((category) => (
                  <li key={category.name} className="rs-preview-cat">
                    <span className="rs-preview-cat-row">
                      <span className="rs-preview-cat-name">
                        {category.name}
                      </span>
                      <span className="rs-preview-cat-amount">
                        {formatCurrency(category.amount, "INR")}
                        <span className="rs-preview-cat-percent">
                          {category.percent}%
                        </span>
                      </span>
                    </span>
                    <span className="rs-preview-cat-bar" aria-hidden="true">
                      <span
                        className={`rs-preview-cat-fill ${category.tone}`}
                        style={{ width: `${category.percent * 2.2}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="rs-preview-usage">
                <span>Total budget usage</span>
                <span className="rs-preview-usage-value">64%</span>
              </div>
            </div>
          </div>

          <div className="rs-preview-panel rs-preview-ledger">
            <div className="rs-preview-panel-head">
              <span className="rs-preview-panel-title">Recent Ledger Entries</span>
              <span className="rs-preview-panel-badge">REALTIME FEED</span>
            </div>
            <ul className="rs-preview-ledger-list">
              {LEDGER.map((entry) => {
                const isIncome = entry.amount > 0;
                return (
                  <li key={entry.name} className="rs-preview-ledger-item">
                    <span className="rs-preview-ledger-icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                    <span className="rs-preview-ledger-main">
                      <span className="rs-preview-ledger-name">{entry.name}</span>
                      <span className="rs-preview-ledger-meta">{entry.meta}</span>
                    </span>
                    <span
                      className={`rs-preview-ledger-amount ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(Math.abs(entry.amount), "INR")}
                    </span>
                    <span className="rs-preview-ledger-method">
                      <ReceiptIcon size={12} />
                      {entry.method}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
