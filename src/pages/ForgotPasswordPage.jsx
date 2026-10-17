import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangleIcon,
  Button,
  CheckCircleIcon,
  Input,
} from "../components/ui";
import { resetPassword } from "../services/authService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { isValidEmail } from "../utils/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
    setEmailError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setFormError("");
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section className="page">
        <div>
          <h1 className="auth-title">Check your inbox</h1>
          <p className="auth-subtitle">
            We sent a password reset link to {email.trim()}.
          </p>
        </div>
        <div className="form-alert form-alert-success" role="status">
          <CheckCircleIcon size={18} />
          <span>Follow the link in the email to choose a new password.</span>
        </div>
        <p className="auth-switch">
          <Link to="/login">Back to log in</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <div>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      {formError ? (
        <div className="form-alert form-alert-error" role="alert">
          <AlertTriangleIcon size={18} />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={handleChange}
          error={emailError}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Send reset link
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Back to log in</Link>
      </p>
    </section>
  );
}
