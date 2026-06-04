import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";
import "./Signup.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  // This extracts the secret token directly from the URL!
  const { token } = useParams(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send the new password AND the token to verify they own the email
      await axios.post(`${API_URL}/reset-password/${token}`, { password });
      toast.success("Password successfully changed! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired token.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
        <h1 className="signup-title">Create New Password</h1>
        <p className="signup-subtitle">Your new password must be at least 8 characters.</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-field">
            <label>New Password <span>*</span></label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signup-input"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>
          <button type="submit" className="signup-submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
