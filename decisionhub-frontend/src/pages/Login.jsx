import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="brand">
          <BrandMark />
          <div className="brand-name">DecisionHub</div>
        </div>
        <h2>Great decisions start with great input.</h2>
        <p>Compare options, invite your people, and let the crowd help you choose with confidence.</p>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1 className="display">Welcome back</h1>
          <p className="sub">Log in to pick up where you left off.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
          </div>

          <button className="btn brass full" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
