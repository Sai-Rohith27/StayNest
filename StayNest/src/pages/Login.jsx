import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL, saveAuthToken } from "../utils/api";
import "./Signup.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  const [submitError, setSubmitError] = useState("");
  const errors = {
    username: formData.username.trim() ? "" : "Username is required",
    password: formData.password ? "" : "Password is required",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasErrors) {
      setTouched({ username: true, password: true });
      toast.error("Please enter username and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login`, formData, {
        withCredentials: true,
      });

      saveAuthToken(res.data.token);
      toast.success("Logged in successfully.");
      window.dispatchEvent(new CustomEvent("staynest-auth-change", {
        detail: { user: res.data.user || formData.username },
      }));
      navigate(location.state?.from || "/listings", { replace: true });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.error || "Login failed. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return "signup-input";
    }

    return errors[fieldName] ? "signup-input is-invalid" : "signup-input is-valid";
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
        <h1 className="signup-title">Login to StayNest</h1>
        <p className="signup-subtitle">Login first to create and manage your stays.</p>

        {submitError && <p className="feedback-error">{submitError}</p>}

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <div className="signup-field">
            <label>Username <span>*</span></label>
            <div className="input-wrapper">
              <FieldIcon type="user" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => setTouched((current) => ({ ...current, username: true }))}
                className={getInputClass("username")}
                placeholder="Enter your username"
              />
              {touched.username && !errors.username && <ValidIcon />}
              {touched.username && errors.username && <InvalidIcon />}
            </div>
            {touched.username && errors.username && (
              <p className="feedback-error">{errors.username}</p>
            )}
          </div>

          <div className="signup-field">
            <label>Password <span>*</span></label>
            <div className="input-wrapper has-password-toggle">
              <FieldIcon type="lock" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                className={getInputClass("password")}
                placeholder="Enter your password"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              {touched.password && !errors.password && <ValidIcon className="with-toggle" />}
              {touched.password && errors.password && <InvalidIcon className="with-toggle" />}
            </div>
            {touched.password && errors.password && (
              <p className="feedback-error">{errors.password}</p>
            )}
          </div>
<div style={{ textAlign: "right", marginBottom: "15px" }}>
            <Link to="/forgot-password" style={{ fontSize: "14px", color: "var(--ink-400)", textDecoration: "none" }}>
              Forgot your password?
            </Link>
          </div>
          <button type="submit" className="signup-submit-button">
            Login
          </button>
        </form>

        <p className="signup-switch-copy">
          New to StayNest? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

const FieldIcon = ({ type }) => {
  const paths = {
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return (
    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {paths[type]}
    </svg>
  );
};

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a3 3 0 0 0 3.8 3.8" />
    <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.1 4.2" />
    <path d="M6.1 6.6C3.5 8.5 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8" />
  </svg>
);

const ValidIcon = ({ className = "" }) => (
  <svg className={`status-icon valid-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const InvalidIcon = ({ className = "" }) => (
  <svg className={`status-icon invalid-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default Login;
