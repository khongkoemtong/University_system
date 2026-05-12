import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginAccount } from "./authApi";
import { getAuthHomePath, getAuthSession, saveAuthSession } from "./authSession";
import "./auth.css";

const initialForm = {
  email: "",
  password: "",
};

export default function AuthSignInPage() {
  const navigate = useNavigate();
  const existingSession = getAuthSession();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (existingSession?.user?.role_name) {
    return <Navigate to={getAuthHomePath(existingSession.user.role_name)} replace />;
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const session = await loginAccount(formData);
      saveAuthSession(session);
      navigate(getAuthHomePath(session.user?.role_name), { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-copy">
        <span className="auth-kicker">School Access</span>
        <h1>Sign in for staff or admin control.</h1>
        <p>Use your school account to open the right workspace and continue where your team left off.</p>
        <div className="auth-highlight-list">
          <article>
            <strong>Admin</strong>
            <p>Manage staff, students, reports, attendance, and courses.</p>
          </article>
          <article>
            <strong>Staff</strong>
            <p>Open your teaching dashboard and manage daily classroom work.</p>
          </article>
          <article>
            <strong>Student</strong>
            <p>Sign in to open your personal dashboard after registration.</p>
          </article>
        </div>
      </section>

      <section className="auth-panel auth-panel-form">
        <div className="auth-panel-head">
          <h2>Sign In</h2>
          <p>Enter your email and password.</p>
        </div>

        {submitError ? <div className="auth-feedback is-error">{submitError}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
          </label>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footnote">
          Need a new account? <Link to="/sign-up">Create one here</Link>
        </p>
        <p className="auth-footnote">
          Student account? <Link to="/student-sign-up">Register here</Link>
        </p>
      </section>
    </main>
  );
}
