import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  UserRound,
  Mail,
  LockKeyhole
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Demo registration only: do not store the password.
    localStorage.setItem("jobpilot-registered-email", email);

    localStorage.setItem(
      "jobpilot-profile",
      JSON.stringify({
        name,
        email,
        targetRole: "React Developer",
        location: "",
        linkedin: "",
        portfolio: "",
        about: ""
      })
    );

    // Ensure the user sees the login page after registration.
    localStorage.removeItem("jobpilot-demo-user");

    navigate("/login", {
      replace: true,
      state: { registered: true, email }
    });
  }

  return (
    <div className="auth-page">
      <section className="auth-promo">
        <div className="brand auth-brand">
          <div className="brand-mark">
            <Briefcase size={21} />
          </div>
          <span>JobPilot</span>
        </div>

        <div className="promo-copy">
          <span className="eyebrow">START YOUR JOURNEY</span>

          <h1>Your next opportunity starts here.</h1>

          <p>
            Create your account and keep your job applications,
            interviews, and career progress organized.
          </p>
        </div>

        <div className="promo-foot">
          One workspace for your job search.
        </div>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="eyebrow">CREATE ACCOUNT</span>

          <h2>Sign up for JobPilot</h2>

          <p className="muted">
            Enter your details to get started.
          </p>

          <label>
            Full name
            <div style={{ position: "relative" }}>
              <UserRound
                size={17}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 13,
                  color: "#85869b"
                }}
              />
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </label>

          <label>
            Email address
            <div style={{ position: "relative" }}>
              <Mail
                size={17}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 13,
                  color: "#85869b"
                }}
              />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </label>

          <label>
            Password
            <div style={{ position: "relative" }}>
              <LockKeyhole
                size={17}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 13,
                  color: "#85869b"
                }}
              />
              <input
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingLeft: 38 }}
                minLength={6}
                required
              />
            </div>
          </label>

          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              placeholder="Enter password again"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-primary button-wide"
          >
            Create Account
          </button>

          <p className="muted" style={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "#5b50d6", fontWeight: 700 }}
            >
              Log in
            </Link>
          </p>

          <p className="fine-print">
            Demo registration. This version does not create a
            secure account on a server.
          </p>
        </form>
      </section>
    </div>
  );
}