import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon, InfoIcon } from "./Icons";
import { ToastContext } from "../../context/toastContext";

const TOAST_ICONS = {
  success: CheckCircleIcon,
  error: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

let nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const { type = "info", title, duration = 4500 } = options;
      const id = (nextToastId += 1);
      setToasts((current) => [...current, { id, message, type, title }]);

      if (duration > 0) {
        timersRef.current.set(
          id,
          window.setTimeout(() => dismissToast(id), duration)
        );
      }

      return id;
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success: (message, options) => showToast(message, { ...options, type: "success" }),
      error: (message, options) => showToast(message, { ...options, type: "error" }),
      warning: (message, options) => showToast(message, { ...options, type: "warning" }),
      info: (message, options) => showToast(message, { ...options, type: "info" }),
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type] ?? InfoIcon;
          return (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              role="status"
              aria-live="polite"
            >
              <span className="toast-icon">
                <Icon size={18} />
              </span>
              <div className="toast-content">
                {toast.title ? <strong className="toast-title">{toast.title}</strong> : null}
                <span className="toast-message">{toast.message}</span>
              </div>
              <button
                type="button"
                className="icon-btn icon-btn-sm"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
