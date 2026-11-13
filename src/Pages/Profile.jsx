import API from "../services/api";
import { useState, useEffect } from "react";
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
  const storedUser = localStorage.getItem("jobpilot-user");

  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Unable to read user:", error);
  }

  return {
    name: user.full_name || "",
    email: user.email || "",
    targetRole: "",
    location: "",
    linkedin: "",
    portfolio: "",
    about: ""
  };
}



export default function Profile() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // FETCH PROFILE FROM MYSQL
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await API.get("/profile");
        const data = response.data.profile;

        setProfile({
          name: data.full_name || "",
          email: data.email || "",
          targetRole: data.target_role || "",
          location: data.preferred_location || "",
          linkedin: data.linkedin_url || "",
          portfolio: data.portfolio_url || "",
          about: data.professional_summary || ""
        });

      } catch (error) {
        console.error("Unable to fetch profile:", error);
        setSaveError(
          error.response?.data?.error || "Unable to load profile."
        );
      }
    }

    fetchProfile();
  }, []);

  // Your handleChange function comes here

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
    setSaveError("");
  }

  async function handleSubmit(event) {
  event.preventDefault();

  setMessage("");
  setSaveError("");

  const cleanProfile = {
    full_name: profile.name.trim(),
    target_role: profile.targetRole.trim(),
    preferred_location: profile.location.trim(),
    linkedin_url: profile.linkedin.trim(),
    portfolio_url: profile.portfolio.trim(),
    professional_summary: profile.about.trim()
  };

  try {
    const response = await API.put("/profile", cleanProfile);

    setProfile((previous) => ({
      ...previous,
      name: cleanProfile.full_name
    }));

    const storedUser = JSON.parse(
      localStorage.getItem("jobpilot-user") || "{}"
    );

    localStorage.setItem(
      "jobpilot-user",
      JSON.stringify({
        ...storedUser,
        full_name: cleanProfile.full_name
      })
    );

    setMessage(response.data.message || "Profile updated successfully!");
  } catch (error) {
    console.error("Profile update error:", error);

    setSaveError(
      error.response?.data?.error || "Unable to update profile."
    );
  }
}
  // Keep your existing getInitials() function
  // and return (...) JSX below this line.



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
    Your profile is securely stored in your JobPilot
    database and associated with your account.
  </p>
</div>

    </div>
  );
}

