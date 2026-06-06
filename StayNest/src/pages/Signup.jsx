import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // 2. Tracking which fields the user has clicked/typed in
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  // 3. Storing validation errors
  const [errors, setErrors] = useState({
    username: "Username is required",
    email: "Email is required",
    password: "Password is required",
  });

  // 4. Password strength state (0-4)
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 5. Real-time validation logic
  useEffect(() => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username cannot be empty";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation & Strength Calculation
    if (!formData.password) {
      newErrors.password = "Password is required";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPasswordStrength(0);
    } else {
      let strength = 0;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1; 
      
      setPasswordStrength(strength);

      if (strength < 2) {
        newErrors.password = "Password is too weak. Add numbers or special characters.";
      }
    }

    setErrors(newErrors);
  }, [formData]);

  // 6. Input Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // 7. Submit Handler (Connected to Backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Stop submission if there are validation errors
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      setTouched({ username: true, email: true, password: true });
      return;
    }

    try {
      // Send data to your Express backend
      await axios.post("https://staynest-cr08.onrender.com/signup", formData, {
        withCredentials: true,
      });
      
      // Fire success pop-up
      toast.success("Your account was created successfully. Please login.");
      
      // Redirect to login page
      navigate("/login");
      
    } catch (err) {
      console.error(err);
      // Fire error pop-up based on backend response
      const errorMessage = err.response?.data?.error || "Registration failed. Try again.";
      toast.error(errorMessage);
    }
  };

  // Helper to determine border color classes
  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) return "signup-input";
    return errors[fieldName] ? "signup-input is-invalid" : "signup-input is-valid";
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
        <h1 className="signup-title">Sign up on StayNest</h1>
        <p className="signup-subtitle">Create your account to start hosting and booking.</p>

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          
          {/* USERNAME FIELD */}
          <div className="signup-field">
            <label>Username <span>*</span></label>
            <div className="input-wrapper">
              <FieldIcon type="user" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("username")}
                placeholder="e.g. SaiRohith27"
              />
              {touched.username && !errors.username && <ValidIcon />}
              {touched.username && errors.username && <InvalidIcon />}
            </div>
            {touched.username && !errors.username && <p className="feedback-success">Looks good!</p>}
            {touched.username && errors.username && <p className="feedback-error">{errors.username}</p>}
          </div>

          {/* EMAIL FIELD */}
          <div className="signup-field">
            <label>Email <span>*</span></label>
            <div className="input-wrapper">
              <FieldIcon type="mail" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("email")}
                placeholder="name@example.com"
              />
              {touched.email && !errors.email && <ValidIcon />}
              {touched.email && errors.email && <InvalidIcon />}
            </div>
            {touched.email && !errors.email && <p className="feedback-success">Valid email!</p>}
            {touched.email && errors.email && <p className="feedback-error">{errors.email}</p>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="signup-field">
            <label>Password <span>*</span></label>
            <div className="input-wrapper has-password-toggle">
              <FieldIcon type="lock" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("password")}
                placeholder="Min. 8 characters"
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
            {touched.password && errors.password && <p className="feedback-error">{errors.password}</p>}
            
            {/* PASSWORD STRENGTH METER */}
            <div className="strength-meter">
              <div className={`strength-bar ${passwordStrength >= 1 ? "weak" : ""}`}></div>
              <div className={`strength-bar ${passwordStrength >= 2 ? "fair" : ""}`}></div>
              <div className={`strength-bar ${passwordStrength >= 3 ? "good" : ""}`}></div>
              <div className={`strength-bar ${passwordStrength >= 4 ? "strong" : ""}`}></div>
            </div>
            <p className="strength-text">
              {passwordStrength === 0 && "Enter a password"}
              {passwordStrength === 1 && "Weak (Add numbers or letters)"}
              {passwordStrength === 2 && "Fair (Add uppercase or special characters)"}
              {passwordStrength === 3 && "Good (Almost there!)"}
              {passwordStrength === 4 && "Strong password!"}
            </p>
          </div>

          <button 
            type="submit" 
            className="signup-submit-button"
            disabled={Object.keys(errors).length > 0 && touched.username && touched.email && touched.password}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

// Inline SVGs for the Checkmark and Exclamation point
const FieldIcon = ({ type }) => {
  const paths = {
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
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

export default Signup;
