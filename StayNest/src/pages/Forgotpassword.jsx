import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Signup.css"; // Recycling your awesome CSS!

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiUrl}/forgot-password`, { email });
      toast.success("Reset link sent! Please check your inbox.");
      setEmail(""); // Clear the input
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
        <h1 className="signup-title">Reset Password</h1>
        <p className="signup-subtitle">Enter your email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-field">
            <label>Email <span>*</span></label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signup-input"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <button type="submit" className="signup-submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="signup-switch-copy">
          Remembered your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;