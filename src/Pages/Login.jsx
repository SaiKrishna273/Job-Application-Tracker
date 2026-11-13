
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  TrendingUp
} from "lucide-react";

import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/login", {
        email: cleanEmail,
        password: password
      });

      const { token, user } = response.data;

      if (!token || !user) {
        setError("Invalid server response. Please try again.");
        return;
      }

      // Save authentication details
      localStorage.setItem("jobpilot-token", token);
      localStorage.setItem(
        "jobpilot-user",
        JSON.stringify(user)
      );

      // Remove old demo authentication
     localStorage.removeItem("jobpilot-demo-user");

// Notify JobsContext that login was successful
window.dispatchEvent(
  new Event("jobpilot-auth-changed")
);

navigate("/", { replace: true });

    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.error || "Login failed."
        );
      } else {
        setError(
          "Cannot connect to server. Please check your Flask backend."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      {/* Left promotional section */}
      <section className="auth-promo">

        <div className="brand auth-brand">
          <div className="brand-mark">
            <Briefcase size={21} />
          </div>

          <span>JobPilot</span>
        </div>

        <div className="promo-copy">
          <span className="eyebrow">
            YOUR CAREER, ORGANIZED
          </span>

          <h1>
            Your next opportunity starts here.
          </h1>

          <p>
            Stop juggling spreadsheets and scattered notes.
            Organize your applications, prepare for interviews,
            and track your progress in one place.
          </p>

          <div className="promo-points">
            <span>
              <CheckCircle2 size={18} />
              Track every job application
            </span>

            <span>
              <CheckCircle2 size={18} />
              Keep interviews organized
            </span>

            <span>
              <TrendingUp size={18} />
              Understand your job search progress
            </span>
          </div>
        </div>

        <div className="promo-foot">
          Make your next career move with confidence.
        </div>
      </section>

      {/* Right login section */}
      <section className="auth-form-wrap">

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h2>Sign in to JobPilot</h2>

          <p className="muted">
            Enter your details to access your job
            application dashboard.
          </p>

          {/* Email */}
          <label htmlFor="email">
            Email address

            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </label>

          {/* Password */}
          <label htmlFor="password">
            Password

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                style={{ paddingRight: "44px" }}
              />

              <button
                type="button"
                className="icon-button"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                style={{
                  position: "absolute",
                  right: "6px"
                }}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </label>

          {/* Error message */}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            className="button button-primary button-wide"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="muted" style={{ textAlign: "center" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "#5b50d6", fontWeight: 700 }}
            >
              Sign up
            </Link>
          </p>

          <p className="fine-print">
            Your job search, all in one place.
          </p>
        </form>

      </section>
    </div>
  );
}
