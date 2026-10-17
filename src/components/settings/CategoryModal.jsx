import { useId, useState } from "react";
import { AlertTriangleIcon, Button, Input, Modal, useToast } from "../ui";
import { useAuth } from "../../context/authContext";
import {
  addCategory,
  MAX_NAME_LENGTH,
  updateCategory,
} from "../../services/categoryService";

const DEFAULT_PREVIEW_COLOR = "#36d399";

export function CategoryModal({
  open,
  onClose,
  onSaved,
  initial = null,
  defaultType = "expense",
}) {
  const { user } = useAuth();
  const toast = useToast();
  const formId = useId();
  const colorId = useId();
  const isEditing = Boolean(initial);

  const [values, setValues] = useState(() => ({
    type: initial?.type ?? defaultType,
    name: initial?.name ?? "",
    icon: initial?.icon ?? "",
    color: initial?.color ?? DEFAULT_PREVIEW_COLOR,
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleTypeChange = (type) => {
    if (isEditing) return;
    setValues((current) => ({ ...current, type }));
  };

  const validate = () => {
    const nextErrors = {};
    const name = values.name.trim();

    if (!name) {
      nextErrors.name = "Category name is required.";
    } else if (name.length > MAX_NAME_LENGTH) {
      nextErrors.name = `Category name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    }

    return nextErrors;
  };

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!user?.uid) {
      setFormError("You need to be signed in to manage categories.");
      return;
    }

    setFormError("");
    setSaving(true);

    const payload = {
      name: values.name.trim(),
      icon: values.icon.trim(),
      color: values.color,
    };

    try {
      if (isEditing) {
        await updateCategory(user.uid, initial.id, payload);
        toast.success("Category updated.");
      } else {
        await addCategory(user.uid, { ...payload, type: values.type });
        toast.success("Category added.");
      }
      onSaved?.();
    } catch (error) {
      console.error("[RedSpend] Failed to save category:", error);
      setFormError(
        error?.code
          ? "Could not save the category. Check your connection and try again."
          : error?.message || "Could not save the category."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit category" : "Add category"}
      closeOnOverlayClick={!saving}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {isEditing ? "Save changes" : "Add category"}
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
          <div className="type-toggle" role="group" aria-label="Category type">
            <button
              type="button"
              className={`type-toggle-option type-toggle-expense${
                values.type === "expense" ? " active" : ""
              }`}
              aria-pressed={values.type === "expense"}
              disabled={isEditing}
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
              disabled={isEditing}
              onClick={() => handleTypeChange("income")}
            >
              Income
            </button>
          </div>
          {isEditing ? (
            <p className="field-hint">The type can&apos;t be changed after creation.</p>
          ) : null}
        </div>

        <Input
          label="Name"
          name="name"
          type="text"
          placeholder="e.g. Groceries"
          maxLength={MAX_NAME_LENGTH}
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Emoji"
          name="icon"
          type="text"
          placeholder="🍔"
          maxLength={4}
          value={values.icon}
          onChange={handleChange}
          hint="Optional. Pick any emoji from your keyboard."
        />

        <div className="field">
          <label className="field-label" htmlFor={colorId}>
            Color
          </label>
          <div className="color-field">
            <input
              id={colorId}
              name="color"
              type="color"
              className="color-input"
              value={values.color}
              onChange={handleChange}
            />
            <span className="color-value">{values.color}</span>
          </div>
        </div>

        <div className="category-preview">
          <span
            className="category-badge-icon category-preview-icon"
            style={{ backgroundColor: `${values.color}1f`, color: values.color }}
            aria-hidden="true"
          >
            {values.icon || "🏷️"}
          </span>
          <span className="category-preview-name">
            {values.name.trim() || "Category preview"}
          </span>
        </div>
      </form>
    </Modal>
  );
}
