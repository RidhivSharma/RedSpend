import { Spinner } from "./Spinner";

export function FullPageSpinner({ label = "Loading" }) {
  return (
    <div className="full-page-loader" role="status" aria-live="polite">
      <Spinner size={36} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
