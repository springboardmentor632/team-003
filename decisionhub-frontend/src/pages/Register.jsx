import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    const result = await register(fullName, email, password);
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
        <h2>Stop deciding alone.</h2>
        <p>Join thousands using structured comparison and real votes to make their next big decision.</p>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1 className="display">Create your account</h1>
          <p className="sub">It's free to start — no card required.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label>Full name</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>

          <button className="btn brass full" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
