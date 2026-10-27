import { useEffect, useState } from "react";

import {
  Settings as SettingsIcon,
  SlidersHorizontal,
  Database,
  Download,
  Trash2,
  BriefcaseBusiness,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react";

import { Link } from "react-router-dom";
import { useJobs } from "../context/JobsContext";

const SETTINGS_KEY = "jobpilot-settings";
const PROFILE_KEY = "jobpilot-profile";

// Load saved settings
function getInitialSettings() {
  const defaults = {
    compactLayout: false,
    theme: "light"
  };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    return saved
      ? { ...defaults, ...JSON.parse(saved) }
      : defaults;
  } catch {
    return defaults;
  }
}

export default function SettingsPage() {
  const { jobs, clearJobs } = useJobs();

  const [settings, setSettings] = useState(
    getInitialSettings
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Save settings and apply theme
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      // Apply compact layout
      if (settings.compactLayout) {
        document.documentElement.dataset.density =
          "compact";
      } else {
        delete document.documentElement.dataset.density;
      }

      // Apply light or dark theme
      document.documentElement.dataset.theme =
        settings.theme || "light";
    } catch (storageError) {
      console.error(
        "Unable to save settings:",
        storageError
      );

      setError(
        "Unable to save your preferences in this browser."
      );
    }
  }, [settings]);

  // Toggle compact layout
  function handleCompactLayout() {
    setSettings((previous) => ({
      ...previous,
      compactLayout: !previous.compactLayout
    }));

    setMessage("Preferences updated.");
    setError("");
  }

  // Toggle dark and light themes
  function handleThemeChange() {
    setSettings((previous) => ({
      ...previous,
      theme:
        previous.theme === "dark" ? "light" : "dark"
    }));

    setMessage("Theme updated successfully.");
    setError("");
  }

  // Export applications and profile as JSON
  function handleExport() {
    try {
      let profile = null;

      const savedProfile =
        localStorage.getItem(PROFILE_KEY);

      if (savedProfile) {
        try {
          profile = JSON.parse(savedProfile);
        } catch {
          profile = null;
        }
      }

      const backup = {
        application: "JobPilot",
        version: 1,
        exportedAt: new Date().toISOString(),
        profile,
        applications: jobs
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const downloadLink =
        document.createElement("a");

      downloadLink.href = url;

      downloadLink.download =
        `jobpilot-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setMessage(
        "Your backup download has started."
      );

      setError("");
    } catch (exportError) {
      console.error(
        "Export failed:",
        exportError
      );

      setError("Unable to export your data.");
      setMessage("");
    }
  }

  // Clear all job applications
  function handleClearApplications() {
    if (jobs.length === 0) {
      setMessage(
        "There are no applications to clear."
      );

      setError("");
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${jobs.length} job applications? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      clearJobs();

      setMessage(
        "All job applications have been deleted."
      );

      setError("");
    } catch (clearError) {
      console.error(
        "Unable to clear applications:",
        clearError
      );

      setError(
        "Unable to clear your applications."
      );

      setMessage("");
    }
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            PERSONALIZE YOUR WORKSPACE
          </span>

          <h1>Settings</h1>

          <p>
            Manage your preferences and job application data.
          </p>
        </div>

        <div className="round-icon">
          <SettingsIcon size={23} />
        </div>
      </div>

      {/* Success message */}
      {message && (
        <div className="notice" role="status">
          <strong>
            <CheckCircle2
              size={15}
              style={{
                verticalAlign: "middle",
                marginRight: "6px"
              }}
            />

            {message}
          </strong>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="notice" role="alert">
          <strong>{error}</strong>
        </div>
      )}

      {/* Appearance settings */}
      <section className="panel">

        <div
          style={{
            padding: "21px 22px",
            borderBottom: "1px solid #f0f0f5"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div className="settings-icon">
              <SlidersHorizontal size={19} />
            </div>

            <div>
              <h2
                style={{
                  fontSize: "15px",
                  margin: "0 0 5px"
                }}
              >
                Appearance
              </h2>

              <p
                style={{
                  fontSize: "11px",
                  color: "#85869b",
                  margin: 0
                }}
              >
                Customize how your JobPilot workspace looks.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-list">

          {/* Light / Dark Theme */}
          <div className="settings-row">

            <div className="settings-icon">
              {settings.theme === "dark" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </div>

            <div className="settings-copy">
              <h3>
                {settings.theme === "dark"
                  ? "Dark Mode"
                  : "Light Mode"}
              </h3>

              <p>
                Switch between light and dark appearance.
                Your preference is saved in this browser.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.theme === "dark"}
                onChange={handleThemeChange}
                aria-label="Enable dark mode"
              />

              <span />
            </label>

          </div>

          {/* Compact layout */}
          <div className="settings-row">

            <div className="settings-icon">
              <SettingsIcon size={19} />
            </div>

            <div className="settings-copy">
              <h3>Compact Table Layout</h3>

              <p>
                Reduce spacing in application tables to
                display more records on the screen.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.compactLayout}
                onChange={handleCompactLayout}
                aria-label="Enable compact table layout"
              />

              <span />
            </label>

          </div>
        </div>
      </section>

      {/* Data management */}
      <section className="panel">

        <div
          style={{
            padding: "21px 22px",
            borderBottom: "1px solid #f0f0f5"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div className="settings-icon">
              <Database size={19} />
            </div>

            <div>
              <h2
                style={{
                  fontSize: "15px",
                  margin: "0 0 5px"
                }}
              >
                Data Management
              </h2>

              <p
                style={{
                  fontSize: "11px",
                  color: "#85869b",
                  margin: 0
                }}
              >
                Export or manage your saved job applications.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-list">

          {/* Application count */}
          <div className="settings-row">

            <div className="settings-icon">
              <BriefcaseBusiness size={19} />
            </div>

            <div className="settings-copy">
              <h3>Saved Applications</h3>

              <p>
                Total number of job records stored in your tracker.
              </p>
            </div>

            <span className="settings-value">
              {jobs.length} records
            </span>

          </div>

          {/* Export data */}
          <div className="settings-row">

            <div className="settings-icon">
              <Download size={19} />
            </div>

            <div className="settings-copy">
              <h3>Export Your Data</h3>

              <p>
                Download a JSON backup containing your
                applications and saved profile.
              </p>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={handleExport}
            >
              <Download size={15} />
              Export
            </button>

          </div>

          {/* Clear applications */}
          <div className="settings-row">

            <div className="settings-icon danger-soft">
              <Trash2 size={19} />
            </div>

            <div className="settings-copy">
              <h3>Clear All Applications</h3>

              <p>
                Permanently remove all saved job application
                records from this browser.
              </p>
            </div>

            <button
              type="button"
              className="button button-danger"
              onClick={handleClearApplications}
              disabled={jobs.length === 0}
            >
              <Trash2 size={15} />
              Clear Data
            </button>

          </div>

        </div>
      </section>

      {/* Profile settings */}
      <section className="panel">

        <div className="settings-list">

          <div className="settings-row">

            <div className="settings-icon">
              <UserRound size={19} />
            </div>

            <div className="settings-copy">
              <h3>Profile Information</h3>

              <p>
                Update your name, target role, location,
                LinkedIn profile, and portfolio.
              </p>
            </div>

            <Link
              to="/profile"
              className="button button-secondary"
            >
              Edit Profile
            </Link>

          </div>

        </div>
      </section>

      {/* Information */}
      <div className="notice">

        <strong>
          <AlertTriangle
            size={15}
            style={{
              verticalAlign: "middle",
              marginRight: "6px"
            }}
          />

          About LocalStorage
        </strong>

        <p>
          JobPilot saves application data, profile information,
          and preferences in your browser. Clearing browser
          storage may remove this data. Export a backup
          regularly if you need to keep a copy.
        </p>

      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "12px",
          color: "#85869b",
          fontSize: "11px"
        }}
      >
        JobPilot · Job Application Tracker · React
      </div>

    </div>
  );
}