import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";

import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",

    email: "",

    password: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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
    if (!form.username.trim()) {
      return "Username is required";
    }

    if (form.username.trim().length < 3) {
      return "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      return "Email is required";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Enter a valid email";
    }

    if (!form.password) {
      return "Password is required";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
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

    setSuccess("");

    try {
      const payload = {
        username: form.username.trim(),

        email: form.email.trim(),

        password: form.password,
      };

      const res = await API.post("/auth/register", payload);

      if (res.data.success) {
        setSuccess("Registration successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Registration failed");
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

        <h1 className="auth-title">Create account</h1>

        <p className="auth-subtitle">Join VidStream today</p>

        {/* ERROR */}

        {error && <p className="error-msg">{error}</p>}

        {/* SUCCESS */}

        {success && <p className="success-msg">{success}</p>}

        {/* FORM */}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              className="form-input"
              minLength={3}
            />
          </div>

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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
