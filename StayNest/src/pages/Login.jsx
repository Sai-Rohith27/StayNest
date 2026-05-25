import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Signup.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
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
      await axios.post("http://localhost:3030/login", formData, {
        withCredentials: true,
      });

      toast.success("Logged in successfully.");
      window.dispatchEvent(new Event("staynest-auth-change"));
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
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                className={getInputClass("password")}
                placeholder="Enter your password"
              />
              {touched.password && !errors.password && <ValidIcon />}
              {touched.password && errors.password && <InvalidIcon />}
            </div>
            {touched.password && errors.password && (
              <p className="feedback-error">{errors.password}</p>
            )}
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

const ValidIcon = () => (
  <svg className="status-icon valid-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const InvalidIcon = () => (
  <svg className="status-icon invalid-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default Login;
