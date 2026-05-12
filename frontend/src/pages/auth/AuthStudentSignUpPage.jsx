import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { registerStudentAccount } from "./authApi";
import { getAuthHomePath, getAuthSession, saveAuthSession } from "./authSession";
import "./auth.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  studentCode: "",
  phone: "",
  gender: "",
  dob: "",
  address: "",
};

function isLocalOnlyOrigin(value) {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(String(value).trim());
}

export default function AuthStudentSignUpPage() {
  const navigate = useNavigate();
  const existingSession = getAuthSession();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const configuredOrigin = String(import.meta.env.VITE_PUBLIC_APP_URL || "").trim();
  const publicOrigin =
    configuredOrigin && !isLocalOnlyOrigin(configuredOrigin)
      ? configuredOrigin
      : browserOrigin && !isLocalOnlyOrigin(browserOrigin)
        ? browserOrigin
        : configuredOrigin || browserOrigin;
  const qrTarget = `${String(publicOrigin).replace(/\/$/, "")}/#/student-sign-up`;
  const isLocalhostTarget = isLocalOnlyOrigin(publicOrigin);

  if (existingSession?.user?.role_name) {
    return <Navigate to="/sign-in" replace />;
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
    setSubmitSuccess("");

    try {
      const studentAccount = await registerStudentAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        student_code: formData.studentCode,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob || null,
        address: formData.address,
      });

      const session = {
        user: {
          id: studentAccount.user_id,
          name: studentAccount.name,
          email: studentAccount.email,
          role_id: studentAccount.role_id,
          role_name: studentAccount.role_name || "student",
        },
        student: studentAccount,
      };

      saveAuthSession(session);
      navigate(getAuthHomePath(session.user.role_name), { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to register student right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-copy">
        <span className="auth-kicker">Student Register</span>
        <h1>Create a student account.</h1>
        <p>Fill in your student information and the account will be saved directly to the database with automatic class assignment.</p>
        <div className="auth-highlight-list">
          <article>
            <strong>Auto Class Placement</strong>
            <p>Your account goes to the next class that still has space.</p>
          </article>
          <article>
            <strong>Phone Validation</strong>
            <p>If the phone number already exists, the form will show that validation message immediately from the API.</p>
          </article>
        </div>
        <article className="auth-qr-card">
          <div>
            <strong>Scan To Register</strong>
            <p>Open the student register page on another device by scanning this QR code.</p>
          </div>
          <div className="auth-qr-code-wrap">
            <QRCodeSVG value={qrTarget} size={160} bgColor="#ffffff" fgColor="#0f172a" level="M" includeMargin />
          </div>
          <code className="auth-qr-link">{qrTarget}</code>
          {isLocalhostTarget ? (
            <p className="auth-qr-note">Open this page from your computer using your local IP first, or set `VITE_PUBLIC_APP_URL` to that IP, so phones can reach the QR link.</p>
          ) : null}
        </article>
      </section>

      <section className="auth-panel auth-panel-form">
        <div className="auth-panel-head">
          <h2>Student Sign Up</h2>
          <p>Register your student account and save it straight into the system.</p>
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
            <span>Student Code</span>
            <input type="text" name="studentCode" value={formData.studentCode} onChange={handleInputChange} required />
          </label>

          <label>
            <span>Phone Number</span>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="012345678" required />
          </label>

          <label>
            <span>Gender</span>
            <select name="gender" value={formData.gender} onChange={handleInputChange}>
              <option value="">Choose gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label>
            <span>Date of Birth</span>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
          </label>

          <label>
            <span>Address</span>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
          </label>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Student Account"}
          </button>
        </form>

        <p className="auth-footnote">
          Need staff approval instead? <Link to="/sign-up">Staff sign up</Link>
        </p>
        <p className="auth-footnote">
          Already have an account? <Link to="/sign-in">Sign in here</Link>
        </p>
      </section>
    </main>
  );
}
