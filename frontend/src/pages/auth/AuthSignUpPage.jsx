import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchStaffPositions, registerAccount } from "./authApi";
import { getAuthSession } from "./authSession";
import "./auth.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  staffCode: "",
  position: "Teacher",
};

export default function AuthSignUpPage() {
  const existingSession = getAuthSession();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [positionOptions, setPositionOptions] = useState(["Teacher"]);

  if (existingSession?.user?.role_name) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    let isCancelled = false;
    async function loadPositions() {
      try {
        const positions = await fetchStaffPositions();

        if (!isCancelled && positions.length) {
          setPositionOptions(positions);
          setFormData((current) => ({
            ...current,
            position: positions.includes(current.position) ? current.position : positions[0],
          }));
        }
      } catch {
        if (!isCancelled) {
          setPositionOptions(["Teacher"]);
        }
      }
    }

    loadPositions();

    return () => {
      isCancelled = true;
    };
  }, []);

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
    setSubmitSuccess("");

    try {
      await registerAccount({
        account_type: "staff",
        name: formData.name,
        email: formData.email,
        password: formData.password,
        staff_code: formData.staffCode,
        position: formData.position,
      });

      setSubmitSuccess("Your request was sent. Please wait for admin approval before signing in.");
      setFormData(initialForm);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign up right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-copy">
        <span className="auth-kicker">New Account</span>
        <h1>Create a staff account request.</h1>
        <p>Fill in your details, choose your staff position, and send the request for admin approval.</p>
        <div className="auth-highlight-list">
          <article>
            <strong>Staff Sign Up</strong>
            <p>Sends a staff access request with your staff code and position to the admin approval inbox.</p>
          </article>
        </div>
      </section>

      <section className="auth-panel auth-panel-form">
        <div className="auth-panel-head">
          <h2>Sign Up</h2>
          <p>Choose your staff position and send the request for admin approval.</p>
        </div>

        {submitError ? <div className="auth-feedback is-error">{submitError}</div> : null}
        {submitSuccess ? <div className="auth-feedback is-success">{submitSuccess}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </label>

          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} minLength={6} required />
          </label>

          <label>
            <span>Staff Code</span>
            <input type="text" name="staffCode" value={formData.staffCode} onChange={handleInputChange} required />
          </label>

          <label>
            <span>Position</span>
            <select name="position" value={formData.position} onChange={handleInputChange}>
              {positionOptions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending Request..." : "Send Approval Request"}
          </button>
        </form>

        <p className="auth-footnote">
          After approval, you can <Link to="/sign-in">sign in here</Link>
        </p>
        <p className="auth-footnote">
          Student account? <Link to="/student-sign-up">Register as student</Link>
        </p>
      </section>
    </main>
  );
}
