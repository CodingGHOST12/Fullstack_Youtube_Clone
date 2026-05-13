import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import API from "../api/axios";

import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",

    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ======================
  // HANDLE INPUT
  // ======================

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,

      [e.target.name]: e.target.value,
    }));

  // ======================
  // VALIDATION
  // ======================

  const validate = () => {
    if (!form.email.trim()) {
      return "Email is required";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Enter a valid email";
    }

    if (!form.password) {
      return "Password is required";
    }

    return null;
  };

  // ======================
  // SUBMIT
  // ======================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);

      return;
    }

    setLoading(true);

    setError("");

    try {
      const payload = {
        email: form.email.trim(),

        password: form.password,
      };

      const res = await API.post("/auth/login", payload);

      // IMPORTANT

      const user = res.data.user;

      const token = res.data.token;

      login(user, token);

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LOGO */}

        <div className="auth-logo">
          <span className="auth-logo-icon">▶</span>

          <span>VidStream</span>
        </div>

        {/* HEADER */}

        <h1 className="auth-title">Welcome back</h1>

        <p className="auth-subtitle">Sign in to your account</p>

        {/* ERROR */}

        {error && <p className="error-msg">{error}</p>}

        {/* FORM */}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
