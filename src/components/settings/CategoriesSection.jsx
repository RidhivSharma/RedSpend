import { useState } from "react";
import {
  AlertTriangleIcon,
  Button,
  ConfirmDialog,
  EditIcon,
  EmptyState,
  PlusIcon,
  TrashIcon,
  useToast,
} from "../ui";
import { CategoryModal } from "./CategoryModal";
import { useAuth } from "../../context/authContext";
import { useCategories } from "../../hooks/useCategories";
import { deleteCategory } from "../../services/categoryService";

const FALLBACK_ICON = "🏷️";
const FALLBACK_COLOR = "#64748b";

function CategoryGroup({ title, categories, onAdd, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="settings-section-head">
        <div>
          <h2 className="card-title">{title}</h2>
          <p className="card-subtitle">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <PlusIcon size={16} />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="settings-empty-hint">No {title.toLowerCase()} yet.</p>
      ) : (
        <ul className="settings-list">
          {categories.map((category) => {
            const color = category.color || FALLBACK_COLOR;
            return (
              <li key={category.id} className="settings-item">
                <span
                  className="category-badge-icon"
                  style={{ backgroundColor: `${color}1f`, color }}
                  aria-hidden="true"
                >
                  {category.icon || FALLBACK_ICON}
                </span>
                <span className="settings-item-name">{category.name}</span>
                <div className="settings-item-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-sm"
                    onClick={() => onEdit(category)}
                    aria-label={`Edit ${category.name}`}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-sm icon-btn-danger"
                    onClick={() => onDelete(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="card">
      <div className="tx-skeleton" role="status" aria-label="Loading categories">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="tx-skeleton-row" key={index}>
            <span className="skeleton skeleton-circle tx-skeleton-dot" />
            <span className="skeleton skeleton-text tx-skeleton-main" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriesSection() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: categories, loading, error, refresh } = useCategories();
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const expenseCategories = categories.filter((category) => category.type === "expense");
  const incomeCategories = categories.filter((category) => category.type === "income");

  const handleDeleteConfirm = async () => {
    if (!deleting || !user?.uid) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(user.uid, deleting.id);
      setDeleting(null);
      toast.success("Category deleted.");
    } catch (deleteError) {
      console.error("[RedSpend] Failed to delete category:", deleteError);
      toast.error(
        deleteError?.code
          ? "Could not delete the category. Check your connection and try again."
          : deleteError?.message || "Could not delete the category."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-stack">
        <CategoriesSkeleton />
        <CategoriesSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <EmptyState
          icon={<AlertTriangleIcon size={24} />}
          title="Something went wrong"
          description={error}
          action={
            <Button variant="secondary" onClick={refresh}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="settings-stack">
      <CategoryGroup
        title="Expense categories"
        categories={expenseCategories}
        onAdd={() => setModal({ editing: null, defaultType: "expense" })}
        onEdit={(category) => setModal({ editing: category, defaultType: category.type })}
        onDelete={setDeleting}
      />
      <CategoryGroup
        title="Income categories"
        categories={incomeCategories}
        onAdd={() => setModal({ editing: null, defaultType: "income" })}
        onEdit={(category) => setModal({ editing: category, defaultType: category.type })}
        onDelete={setDeleting}
      />

      {modal ? (
        <CategoryModal
          open
          onClose={() => setModal(null)}
          onSaved={() => setModal(null)}
          initial={modal.editing}
          defaultType={modal.defaultType}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category?"
        message={
          deleting
            ? `This will permanently delete "${deleting.name}". Categories used by transactions can't be deleted.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteLoading) setDeleting(null);
        }}
      />
    </div>
  );
}
