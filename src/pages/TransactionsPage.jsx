import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  Button,
  ConfirmDialog,
  DownloadIcon,
  EmptyState,
  PlusIcon,
  ReceiptIcon,
  useToast,
} from "../components/ui";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import {
  TransactionList,
  TransactionListSkeleton,
} from "../components/transactions/TransactionList";
import { TransactionModal } from "../components/transactions/TransactionModal";
import { useAuth } from "../context/authContext";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { deleteTransaction } from "../services/transactionService";
import { balance, totalExpense, totalIncome } from "../utils/calc";
import { formatDate, toDate } from "../utils/dateHelpers";
import { exportTransactionsCSV } from "../utils/export";
import { formatCurrency } from "../utils/format";
import { DEFAULT_FILTERS, resolveDateRange } from "../utils/transactionFilters";

const PAGE_SIZE = 10;

function transactionComparator(sort) {
  const dateValue = (transaction) => toDate(transaction.date)?.getTime() ?? 0;
  const amountValue = (transaction) => {
    const amount = Number(transaction.amount);
    return Number.isFinite(amount) ? amount : 0;
  };

  switch (sort) {
    case "date-asc":
      return (a, b) => dateValue(a) - dateValue(b);
    case "amount-desc":
      return (a, b) =>
        amountValue(b) - amountValue(a) || dateValue(b) - dateValue(a);
    case "amount-asc":
      return (a, b) =>
        amountValue(a) - amountValue(b) || dateValue(b) - dateValue(a);
    case "date-desc":
    default:
      return (a, b) => dateValue(b) - dateValue(a);
  }
}

function SummaryCard({ label, value, tone = "", loading = false }) {
  return (
    <div className="card tx-summary-card">
      <span className="tx-summary-label">{label}</span>
      {loading ? (
        <span className="skeleton tx-summary-skeleton" aria-hidden="true" />
      ) : (
        <span className={`tx-summary-value ${tone}`.trim()}>{value}</span>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const { user, profile } = useAuth();
  const uid = user?.uid;
  const currency = profile?.currency || "INR";
  const toast = useToast();

  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  } = useCategories();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = transactionsLoading || categoriesLoading;
  const error = transactionsError || categoriesError;

  const categoriesById = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const { start, end } = resolveDateRange(filters);
    const search = filters.search.trim().toLowerCase();

    const result = transactions.filter((transaction) => {
      const date = toDate(transaction.date);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      if (filters.type !== "all" && transaction.type !== filters.type) return false;
      if (filters.categoryId !== "all" && transaction.categoryId !== filters.categoryId) {
        return false;
      }
      if (search) {
        const haystack = `${transaction.note || ""} ${
          transaction.categoryName || ""
        }`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    result.sort(transactionComparator(filters.sort));
    return result;
  }, [transactions, filters]);

  const summary = useMemo(
    () => ({
      income: totalIncome(filtered),
      expense: totalExpense(filtered),
      balance: balance(filtered),
    }),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFiltersChange = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleRetry = () => {
    if (transactionsError) refreshTransactions();
    if (categoriesError) refreshCategories();
  };

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleExportCSV = () => {
    try {
      exportTransactionsCSV(filtered);
      toast.success(
        `Exported ${filtered.length} ${
          filtered.length === 1 ? "transaction" : "transactions"
        } to CSV.`
      );
    } catch (exportError) {
      console.error("[SpendWise] Failed to export CSV:", exportError);
      toast.error("Could not export the transactions. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || !uid) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(uid, deleting.id);
      setDeleting(null);
      toast.success("Transaction deleted.");
    } catch (deleteError) {
      console.error("[SpendWise] Failed to delete transaction:", deleteError);
      toast.error(
        "Could not delete the transaction. Check your connection and try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Track, filter and manage your income and spending.
          </p>
        </div>
        <div className="page-head-actions">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={loading || filtered.length === 0}
          >
            <DownloadIcon size={18} />
            Export CSV
          </Button>
          <Button onClick={openAddModal} disabled={loading}>
            <PlusIcon size={18} />
            Add transaction
          </Button>
        </div>
      </div>

      <div className="tx-summary">
        <SummaryCard
          label="Income"
          value={formatCurrency(summary.income, currency)}
          tone="text-income"
          loading={loading}
        />
        <SummaryCard
          label="Expenses"
          value={formatCurrency(summary.expense, currency)}
          tone="text-expense"
          loading={loading}
        />
        <SummaryCard
          label="Balance"
          value={formatCurrency(summary.balance, currency)}
          tone={summary.balance < 0 ? "text-expense" : "text-income"}
          loading={loading}
        />
      </div>

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="card tx-list-card">
          <TransactionListSkeleton />
        </div>
      ) : error ? (
        <div className="card">
          <EmptyState
            icon={<AlertTriangleIcon size={24} />}
            title="Something went wrong"
            description={error}
            action={
              <Button variant="secondary" onClick={handleRetry}>
                Try again
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ReceiptIcon size={24} />}
            title={
              transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"
            }
            description={
              transactions.length === 0
                ? "Add your first income or expense to start seeing insights."
                : "Try adjusting your filters or search terms."
            }
            action={
              transactions.length === 0 ? (
                <Button onClick={openAddModal}>
                  <PlusIcon size={18} />
                  Add transaction
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleResetFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="card tx-list-card">
          <div className="tx-list-header">
            <h2 className="card-title">Transactions</h2>
            <span className="tx-list-count">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>
          <TransactionList
            transactions={pageItems}
            categoriesById={categoriesById}
            currency={currency}
            onEdit={openEditModal}
            onDelete={setDeleting}
          />
          {totalPages > 1 ? (
            <div className="pagination">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {modalOpen ? (
        <TransactionModal
          open
          onClose={closeModal}
          onSaved={closeModal}
          initial={editing}
          categories={categories}
          transactions={transactions}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction?"
        message={
          deleting
            ? `This will permanently delete the ${
                deleting.categoryName || "selected"
              } transaction of ${formatCurrency(
                deleting.amount,
                currency
              )} on ${formatDate(deleting.date)}.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteLoading) setDeleting(null);
        }}
      />
    </section>
  );
}
