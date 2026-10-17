import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="not-found-code" aria-hidden="true">
        404
      </p>
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-md">
        Back to dashboard
      </Link>
    </section>
  );
}
