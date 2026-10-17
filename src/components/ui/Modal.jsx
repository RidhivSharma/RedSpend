import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) {
      previouslyFocusedRef.current = document.activeElement;
    }
    dialog?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onClose?.()}
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
