import { memo } from "react";
import { EditIcon, TrashIcon } from "../ui";
import { formatDate } from "../../utils/dateHelpers";
import { formatCurrency } from "../../utils/format";

function CategoryBadge({ transaction, meta }) {
  const icon = meta?.icon ?? "🏷️";
  const color = meta?.color;

  return (
    <span className="category-badge">
      <span
        className="category-badge-icon"
        style={color ? { backgroundColor: `${color}1f`, color } : undefined}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="category-badge-name">
        {transaction.categoryName || "Uncategorized"}
      </span>
    </span>
  );
}

function AmountText({ transaction, currency, className = "" }) {
  const isIncome = transaction.type === "income";
  const classes = [
    "tx-amount",
    isIncome ? "text-income" : "text-expense",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {isIncome ? "+" : "−"}
      {formatCurrency(transaction.amount, currency)}
    </span>
  );
}

function RowActions({ transaction, onEdit, onDelete }) {
  const label = `${transaction.categoryName || "transaction"} on ${formatDate(
    transaction.date
  )}`;

  return (
    <div className="tx-actions">
      <button
        type="button"
        className="icon-btn icon-btn-sm"
        onClick={() => onEdit(transaction)}
        aria-label={`Edit ${label}`}
      >
        <EditIcon size={16} />
      </button>
      <button
        type="button"
        className="icon-btn icon-btn-sm icon-btn-danger"
        onClick={() => onDelete(transaction)}
        aria-label={`Delete ${label}`}
      >
        <TrashIcon size={16} />
      </button>
    </div>
  );
}

function TypeBadge({ transaction }) {
  const isIncome = transaction.type === "income";
  return (
    <span className={`badge badge-${isIncome ? "income" : "expense"}`}>
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

export const TransactionList = memo(function TransactionList({
  transactions,
  categoriesById = {},
  currency = "INR",
  onEdit,
  onDelete,
}) {
  return (
    <div className="tx-list">
      <div className="table-wrap tx-table-wrap">
        <table className="table tx-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Category</th>
              <th scope="col">Note</th>
              <th scope="col">Type</th>
              <th scope="col" className="tx-align-right">
                Amount
              </th>
              <th scope="col" className="tx-align-right">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="tx-date">{formatDate(transaction.date)}</td>
                <td>
                  <CategoryBadge
                    transaction={transaction}
                    meta={categoriesById[transaction.categoryId]}
                  />
                </td>
                <td className="tx-note-cell">{transaction.note || "—"}</td>
                <td>
                  <TypeBadge transaction={transaction} />
                </td>
                <td className="tx-align-right">
                  <AmountText transaction={transaction} currency={currency} />
                </td>
                <td className="tx-align-right">
                  <RowActions
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="tx-cards">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="tx-card">
            <div className="tx-card-top">
              <CategoryBadge
                transaction={transaction}
                meta={categoriesById[transaction.categoryId]}
              />
              <AmountText transaction={transaction} currency={currency} />
            </div>
            {transaction.note ? (
              <p className="tx-card-note">{transaction.note}</p>
            ) : null}
            <div className="tx-card-bottom">
              <span className="tx-card-date">{formatDate(transaction.date)}</span>
              <TypeBadge transaction={transaction} />
              <RowActions
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export function TransactionListSkeleton({ rows = 6 }) {
  return (
    <div className="tx-skeleton" role="status" aria-label="Loading transactions">
      {Array.from({ length: rows }, (_, index) => (
        <div className="tx-skeleton-row" key={index}>
          <span className="skeleton skeleton-circle tx-skeleton-dot" />
          <span className="skeleton skeleton-text tx-skeleton-main" />
          <span className="skeleton skeleton-text tx-skeleton-side" />
        </div>
      ))}
    </div>
  );
}
