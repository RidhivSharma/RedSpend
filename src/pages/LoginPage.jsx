import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangleIcon,
  Button,
  GoogleIcon,
  Input,
} from "../components/ui";
import { useAuth } from "../context/authContext";
import { logIn, logInWithGoogle } from "../services/authService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { isValidEmail } from "../utils/validation";

export default function LoginPage() {
  const { sessionExpired } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!values.password) {
      nextErrors.password = "Password is required.";
    } else if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || googleLoading) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setSubmitting(true);
    try {
      await logIn(values.email.trim(), values.password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    if (googleLoading || submitting) return;
    setFormError("");
    setGoogleLoading(true);
    try {
      await logInWithGoogle();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="page">
      <div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to keep tracking your spending.</p>
      </div>

      {formError ? (
        <div className="form-alert form-alert-error" role="alert">
          <AlertTriangleIcon size={18} />
          <span>{formError}</span>
        </div>
      ) : sessionExpired ? (
        <div className="form-alert form-alert-warning" role="alert">
          <AlertTriangleIcon size={18} />
          <span>Your session expired. Please log in again to continue.</span>
        </div>
      ) : null}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Your password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <div className="auth-inline-link">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" fullWidth loading={submitting} disabled={googleLoading}>
          Log in
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <Button
        variant="secondary"
        fullWidth
        onClick={handleGoogleClick}
        loading={googleLoading}
        disabled={submitting}
      >
        <GoogleIcon size={18} />
        Continue with Google
      </Button>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </section>
  );
}
