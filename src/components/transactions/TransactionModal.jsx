import { useId, useState } from "react";
import { AlertTriangleIcon, Button, Input, Modal, Select, useToast } from "../ui";
import { useAuth } from "../../context/authContext";
import { getBudget } from "../../services/budgetService";
import {
  addTransaction,
  MAX_NOTE_LENGTH,
  updateTransaction,
} from "../../services/transactionService";
import { budgetAlertOnAdd } from "../../utils/budgetAlerts";
import { formatMonthKey, monthKey, parseDateInput, toDate } from "../../utils/dateHelpers";
import { formatCurrency } from "../../utils/format";

function toDateInputValue(value) {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactionModal({
  open,
  onClose,
  onSaved,
  initial = null,
  categories = [],
  transactions = [],
}) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const formId = useId();
  const noteId = useId();
  const isEditing = Boolean(initial);
  const currency = profile?.currency || "INR";

  const [values, setValues] = useState(() => ({
    type: initial?.type ?? "expense",
    amount: initial ? String(initial.amount) : "",
    categoryId: initial?.categoryId ?? "",
    date: initial ? toDateInputValue(initial.date) : toDateInputValue(new Date()),
    note: initial?.note ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const typeCategories = categories.filter(
    (category) => category.type === values.type
  );
  const selectedCategory = typeCategories.find(
    (category) => category.id === values.categoryId
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleTypeChange = (type) => {
    setValues((current) => ({
      ...current,
      type,
      categoryId:
        selectedCategory && selectedCategory.type === type ? current.categoryId : "",
    }));
    setErrors((current) => ({ ...current, categoryId: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const amount = Number(values.amount);

    if (!String(values.amount).trim()) {
      nextErrors.amount = "Amount is required.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Enter an amount greater than 0.";
    }

    if (!values.categoryId) {
      nextErrors.categoryId = "Choose a category.";
    }

    if (!values.date) {
      nextErrors.date = "Date is required.";
    } else if (!parseDateInput(values.date)) {
      nextErrors.date = "Enter a valid date.";
    }

    if (values.note.length > MAX_NOTE_LENGTH) {
      nextErrors.note = `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`;
    }

    return nextErrors;
  };

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const checkBudgetAlert = async (payload) => {
    try {
      const alertMonth = monthKey(payload.date);
      const budget = await getBudget(user.uid, alertMonth, payload.categoryId);
      const alert = budgetAlertOnAdd({
        transaction: payload,
        budget,
        existingTransactions: transactions,
      });
      if (!alert) return;

      const monthLabel = formatMonthKey(alert.month);
      if (alert.level === "over") {
        toast.warning(
          `${payload.categoryName} is over its ${monthLabel} budget: ${formatCurrency(
            alert.spentAfter,
            currency
          )} of ${formatCurrency(alert.limit, currency)} spent.`
        );
      } else {
        toast.warning(
          `${payload.categoryName} has reached ${Math.round(
            alert.percent
          )}% of its ${monthLabel} budget.`
        );
      }
    } catch (error) {
      console.error("[RedSpend] Failed to check budget status:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!user?.uid) {
      setFormError("You need to be signed in to save transactions.");
      return;
    }

    setFormError("");
    setSaving(true);

    const payload = {
      type: values.type,
      amount: Number(values.amount),
      categoryId: values.categoryId,
      categoryName: selectedCategory?.name ?? "",
      date: parseDateInput(values.date),
      note: values.note.trim(),
    };

    try {
      if (isEditing) {
        await updateTransaction(user.uid, initial.id, payload);
        toast.success("Transaction updated.");
      } else {
        await addTransaction(user.uid, payload);
        toast.success("Transaction added.");
        checkBudgetAlert(payload);
      }
      onSaved?.();
    } catch (error) {
      console.error("[RedSpend] Failed to save transaction:", error);
      setFormError(
        error?.code
          ? "Could not save the transaction. Check your connection and try again."
          : error?.message || "Could not save the transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit transaction" : "Add transaction"}
      closeOnOverlayClick={!saving}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {isEditing ? "Save changes" : "Add transaction"}
          </Button>
        </>
      }
    >
      {formError ? (
        <div className="form-alert form-alert-error" role="alert">
          <AlertTriangleIcon size={18} />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="form-stack" id={formId} onSubmit={handleSubmit} noValidate>
        <div className="field">
          <span className="field-label">Type</span>
          <div className="type-toggle" role="group" aria-label="Transaction type">
            <button
              type="button"
              className={`type-toggle-option type-toggle-expense${
                values.type === "expense" ? " active" : ""
              }`}
              aria-pressed={values.type === "expense"}
              onClick={() => handleTypeChange("expense")}
            >
              Expense
            </button>
            <button
              type="button"
              className={`type-toggle-option type-toggle-income${
                values.type === "income" ? " active" : ""
              }`}
              aria-pressed={values.type === "income"}
              onClick={() => handleTypeChange("income")}
            >
              Income
            </button>
          </div>
        </div>

        <Input
          label="Amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={values.amount}
          onChange={handleChange}
          error={errors.amount}
        />

        <Select
          label="Category"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
          hint={
            typeCategories.length === 0
              ? "No categories of this type yet. Add one in Settings."
              : undefined
          }
        >
          <option value="" disabled>
            {typeCategories.length === 0 ? "No categories available" : "Select a category"}
          </option>
          {typeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </Select>

        <Input
          label="Date"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
          error={errors.date}
        />

        <div className="field">
          <label className="field-label" htmlFor={noteId}>
            Note (optional)
          </label>
          <textarea
            id={noteId}
            name="note"
            className={`input tx-note-input${errors.note ? " input-error" : ""}`}
            rows={3}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="e.g. Weekly groceries"
            value={values.note}
            onChange={handleChange}
            aria-invalid={errors.note ? true : undefined}
          />
          <div className="tx-note-meta">
            <span className="field-hint">
              {values.note.length}/{MAX_NOTE_LENGTH}
            </span>
            {errors.note ? <span className="field-error">{errors.note}</span> : null}
          </div>
        </div>
      </form>
    </Modal>
  );
}
