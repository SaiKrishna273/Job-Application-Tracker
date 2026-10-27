import { useState } from "react";
import {
  UserRound,
  Save,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";

const PROFILE_STORAGE_KEY = "jobpilot-profile";

function getInitialProfile() {
  const loggedInEmail =
    localStorage.getItem("jobpilot-demo-user") || "";

  const defaultProfile = {
    name: "",
    email: loggedInEmail,
    targetRole: "React Developer",
    location: "",
    linkedin: "",
    portfolio: "",
    about: ""
  };

  try {
    const savedProfile = localStorage.getItem(
      PROFILE_STORAGE_KEY
    );

    if (savedProfile) {
      return {
        ...defaultProfile,
        ...JSON.parse(savedProfile)
      };
    }
  } catch (error) {
    console.error("Unable to load profile:", error);
  }

  return defaultProfile;
}

export default function Profile() {
  const [profile, setProfile] = useState(
    getInitialProfile
  );

  const [message, setMessage] = useState("");

  const [saveError, setSaveError] = useState("");

  // Update profile fields
  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value
    }));

    setMessage("");
    setSaveError("");
  }

  // Save profile in LocalStorage
  function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setSaveError("");

    const cleanProfile = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      targetRole: profile.targetRole.trim(),
      location: profile.location.trim(),
      linkedin: profile.linkedin.trim(),
      portfolio: profile.portfolio.trim(),
      about: profile.about.trim()
    };

    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(cleanProfile)
      );

      setProfile(cleanProfile);
      setMessage("Profile saved successfully!");
    } catch (error) {
      console.error("Unable to save profile:", error);

      setSaveError(
        "Unable to save your profile. Check your browser storage."
      );
    }
  }

  // Generate avatar initials
  function getInitials() {
    const name = profile.name.trim();

    if (!name) {
      return "JS";
    }

    const words = name.split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            PERSONAL INFORMATION
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and career goals.
          </p>
        </div>
      </div>

      {/* Profile summary */}
      <section className="panel panel-pad">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap"
          }}
        >
          <div className="profile-avatar">
            <span style={{ fontSize: "20px" }}>
              {getInitials()}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <h2
              style={{
                fontSize: "19px",
                margin: "0 0 7px"
              }}
            >
              {profile.name || "Your Name"}
            </h2>

            <p
              style={{
                color: "#85869b",
                fontSize: "12px",
                margin: "0 0 6px"
              }}
            >
              {profile.targetRole ||
                "Add your target job role"}
            </p>

            <p
              style={{
                color: "#85869b",
                fontSize: "12px",
                margin: 0
              }}
            >
              {profile.email || "Add your email address"}
            </p>
          </div>

          <span
            className="status-badge status-applied"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <UserRound size={13} />
            Job Seeker
          </span>
        </div>
      </section>

      {/* Profile form */}
      <form
        className="panel job-form profile-form"
        onSubmit={handleSubmit}
      >

        <div className="section-title">
          <div>
            <h2>Personal Information</h2>

            <p>
              Keep your details and career preferences up to date.
            </p>
          </div>
        </div>

        <div className="form-grid">

          {/* Full name */}
          <label>
            Full Name *

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

          {/* Email */}
          <label>
            Email Address *

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {/* Target role */}
          <label>
            Target Job Role

            <input
              type="text"
              name="targetRole"
              value={profile.targetRole}
              onChange={handleChange}
              placeholder="e.g. Python Full Stack Developer"
            />
          </label>

          {/* Location */}
          <label>
            Preferred Location

            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              placeholder="e.g. Hyderabad or Remote"
              autoComplete="address-level2"
            />
          </label>

          {/* LinkedIn URL */}
          <label>
            LinkedIn Profile

            <input
              type="url"
              name="linkedin"
              value={profile.linkedin}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/..."
            />
          </label>

          {/* Portfolio URL */}
          <label>
            Portfolio Website

            <input
              type="url"
              name="portfolio"
              value={profile.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
            />
          </label>

          {/* Professional summary */}
          <label className="full-field">
            Professional Summary

            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
              rows={5}
              maxLength={1000}
              placeholder="Write a short summary about your skills, experience, projects, and career goals..."
            />

            <span
              style={{
                textAlign: "right",
                color: "#85869b",
                fontSize: "10px",
                fontWeight: 400
              }}
            >
              {profile.about.length}/1000 characters
            </span>
          </label>

        </div>

        {/* Save feedback and button */}
        <div className="form-actions">

          {message && (
            <span
              className="success-text"
              role="status"
            >
              <CheckCircle2
                size={15}
                style={{
                  verticalAlign: "middle",
                  marginRight: "5px"
                }}
              />

              {message}
            </span>
          )}

          {saveError && (
            <span
              className="form-error"
              role="alert"
            >
              {saveError}
            </span>
          )}

          <button
            type="submit"
            className="button button-primary"
          >
            <Save size={16} />
            Save Profile
          </button>

        </div>
      </form>

      {/* Storage information */}
      <div className="notice">
        <strong>About your profile data</strong>

        <p>
          Your profile is stored locally in this browser.
          It is not uploaded to a server or automatically
          synchronized across devices.
        </p>
      </div>

    </div>
  );
}