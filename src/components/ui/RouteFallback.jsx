import { Spinner } from "./Spinner";

export function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <Spinner size={30} />
      <span className="visually-hidden">Loading page</span>
    </div>
  );
}
