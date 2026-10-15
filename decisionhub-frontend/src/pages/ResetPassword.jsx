import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { confirmPasswordReset, requestPasswordReset } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (token && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (token) {
        await confirmPasswordReset({ token, newPassword: password });
        setMessage("Your password has been updated. You can now log in.");
      } else {
        const response = await requestPasswordReset(email);
        setMessage(response.data.message);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to process this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isConfirmation = Boolean(token);
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="brand"><BrandMark /><div className="brand-name">DecisionHub</div></div>
        <h2>Get back to better decisions.</h2>
        <p>{isConfirmation ? "Choose a new password to secure your account." : "Enter your email and we’ll send a secure reset link."}</p>
      </div>
      <div className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="display">{isConfirmation ? "Set a new password" : "Reset your password"}</h1>
          <p className="sub">{isConfirmation ? "This link can be used once." : "For security, the response is the same whether or not an account exists."}</p>
          {error && <div className="error-banner">{error}</div>}
          {message && <div className="success-banner">{message}</div>}
          {isConfirmation ? (
            <div className="field"><label>New password</label><input type="password" required minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></div>
          ) : (
            <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" /></div>
          )}
          <button className="btn brass full" type="submit" disabled={submitting}>{submitting ? "Please wait…" : isConfirmation ? "Update password" : "Email reset link"}</button>
          <div className="auth-switch"><Link to="/login">Back to log in</Link></div>
        </form>
      </div>
    </div>
  );
}
