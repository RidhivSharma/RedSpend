import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangleIcon,
  Button,
  GoogleIcon,
  Input,
} from "../components/ui";
import { logInWithGoogle, signUp } from "../services/authService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { isValidEmail } from "../utils/validation";

export default function SignupPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (!values.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (values.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

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

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      await signUp(values.email.trim(), values.password, values.name.trim());
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start tracking your expenses in minutes.</p>
      </div>

      {formError ? (
        <div className="form-alert form-alert-error" role="alert">
          <AlertTriangleIcon size={18} />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <Input
          label="Name"
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button type="submit" fullWidth loading={submitting} disabled={googleLoading}>
          Create account
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
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
