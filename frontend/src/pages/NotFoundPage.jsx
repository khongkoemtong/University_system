import { Link } from "react-router-dom";
import "./not-found.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-shell">
      <section className="not-found-panel">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The route you opened does not exist, was moved, or is not available for this account.</p>

        <div className="not-found-actions">
          <Link to="/sign-in" className="not-found-btn is-primary">
            Go To Sign In
          </Link>
       
        </div>
      </section>
    </main>
  );
}
