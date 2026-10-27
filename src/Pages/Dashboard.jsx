import {
  BriefcaseBusiness,
  CalendarDays,
  Trophy,
  Send,
  ArrowRight,
  Clock3,
  Plus
} from "lucide-react";

import { Link } from "react-router-dom";
import { useJobs } from "../context/JobsContext";
import { STATUSES } from "../data";

// Format dates for display
function formatDate(date) {
  if (!date) return "Date not set";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Get month abbreviation
function getMonth(date) {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
}

// Get status CSS class
function getStatusClass(status) {
  return `status-${String(status || "Applied")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

export default function Dashboard() {
  const { jobs } = useJobs();

  // Calculate application statistics
  const totalApplications = jobs.length;

  const totalInterviews = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const totalOffers = jobs.filter(
    (job) => job.status === "Offer"
  ).length;

  const totalAssessments = jobs.filter(
    (job) => job.status === "Assessment"
  ).length;

  // Count jobs in each pipeline stage
  const statusCounts = STATUSES.map((status) => ({
    status,
    count: jobs.filter(
      (job) => job.status === status
    ).length
  }));

  // Display recent applications first
  const recentJobs = [...jobs]
    .sort((a, b) => {
      return (b.date || "").localeCompare(a.date || "");
    })
    .slice(0, 5);

  // Find upcoming interviews
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingInterviews = jobs
    .filter((job) => {
      if (!job.interviewDate) return false;

      const interviewDate = new Date(
        `${job.interviewDate}T00:00:00`
      );

      return (
        !Number.isNaN(interviewDate.getTime()) &&
        interviewDate >= today
      );
    })
    .sort((a, b) =>
      a.interviewDate.localeCompare(b.interviewDate)
    )
    .slice(0, 4);

  // Calculate a safe pipeline percentage
  function getPercentage(count) {
    if (totalApplications === 0) return 0;

    return Math.round(
      (count / totalApplications) * 100
    );
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            YOUR CAREER WORKSPACE
          </span>

          <h1>Dashboard</h1>

          <p>
            Here's an overview of your job search progress.
          </p>
        </div>

        <Link
          to="/applications/new"
          className="button button-primary"
        >
          <Plus size={17} />
          Add Application
        </Link>
      </div>

      {/* Statistics cards */}
      <div className="stats-grid">

        {/* Total applications */}
        <div className="panel stat-card">
          <div className="stat-icon purple">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Total Applications</p>

          <div className="stat-number">
            {totalApplications}
          </div>

          <span className="stat-note">
            Jobs tracked in JobPilot
          </span>
        </div>

        {/* Interviews */}
        <div className="panel stat-card">
          <div className="stat-icon green">
            <CalendarDays size={20} />
          </div>

          <p>Interview Stage</p>

          <div className="stat-number">
            {totalInterviews}
          </div>

          <span className="stat-note">
            Applications at interview stage
          </span>
        </div>

        {/* Offers */}
        <div className="panel stat-card">
          <div className="stat-icon orange">
            <Trophy size={20} />
          </div>

          <p>Offers Received</p>

          <div className="stat-number">
            {totalOffers}
          </div>

          <span className="stat-note">
            Applications marked as offers
          </span>
        </div>

        {/* Assessments */}
        <div className="panel stat-card">
          <div className="stat-icon blue">
            <Send size={20} />
          </div>

          <p>Assessments</p>

          <div className="stat-number">
            {totalAssessments}
          </div>

          <span className="stat-note">
            Applications at assessment stage
          </span>
        </div>

      </div>

      {/* Pipeline and interviews */}
      <div className="dashboard-grid">

        {/* Application pipeline */}
        <section className="panel panel-pad">
          <div className="section-title">
            <div>
              <h2>Application Pipeline</h2>

              <p>
                Track applications at every stage.
              </p>
            </div>

            <Link
              to="/kanban"
              className="inline-link"
            >
              View board
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="pipeline-list">
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div className="pipeline-meta">
                  <span>{item.status}</span>

                  <strong>
                    {item.count}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className={`progress-fill fill-${item.status.toLowerCase()}`}
                    style={{
                      width: `${getPercentage(item.count)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "25px",
              paddingTop: "17px",
              borderTop: "1px solid #f0f0f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#85869b",
                  marginBottom: "5px"
                }}
              >
                Total tracked
              </span>

              <strong style={{ fontSize: "22px" }}>
                {totalApplications}
              </strong>
            </div>

            <Link
              to="/applications"
              className="button button-secondary button-small"
            >
              All applications
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Upcoming interviews */}
        <section className="panel panel-pad">
          <div className="section-title">
            <div>
              <h2>Upcoming Interviews</h2>

              <p>
                Keep your next opportunities in sight.
              </p>
            </div>

            <Link
              to="/calendar"
              className="inline-link"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="empty-mini">
              <Clock3 size={28} />

              <strong>No upcoming interviews</strong>

              <p>
                Add an interview date to an application
                to see it here.
              </p>

              <Link to="/applications">
                Manage applications
              </Link>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingInterviews.map((job) => {
                const day = job.interviewDate
                  ? new Date(
                      `${job.interviewDate}T00:00:00`
                    ).getDate()
                  : "";

                return (
                  <div
                    className="upcoming-item"
                    key={job.id}
                  >
                    <div className="date-tile">
                      <strong>{day}</strong>

                      <span>
                        {getMonth(job.interviewDate)}
                      </span>
                    </div>

                    <div className="upcoming-info">
                      <strong>{job.company}</strong>

                      <span>{job.role}</span>

                      <span>
                        {formatDate(job.interviewDate)}
                      </span>
                    </div>

                    <Link
                      to={`/applications/${job.id}/edit`}
                      className="icon-button"
                      aria-label={`Edit ${job.company} application`}
                      title="Edit application"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Recent applications */}
      <section className="panel panel-pad">
        <div className="section-title">
          <div>
            <h2>Recent Applications</h2>

            <p>
              Your latest job application activity.
            </p>
          </div>

          <Link
            to="/applications"
            className="inline-link"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="empty-state">
            <div className="round-icon">
              <BriefcaseBusiness size={23} />
            </div>

            <h3>No job applications yet</h3>

            <p>
              Start by adding your first job application.
            </p>

            <Link
              to="/applications/new"
              className="button button-primary"
            >
              <Plus size={16} />
              Add Application
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {recentJobs.map((job) => (
              <div
                className="recent-row"
                key={job.id}
              >
                <div className="company-avatar">
                  {job.company
                    ?.trim()
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <div className="recent-main">
                  <strong>{job.company}</strong>

                  <span>{job.role}</span>
                </div>

                <span className="recent-date">
                  {formatDate(job.date)}
                </span>

                <span
                  className={`status-badge ${getStatusClass(
                    job.status
                  )}`}
                >
                  {job.status || "Applied"}
                </span>

                <Link
                  to={`/applications/${job.id}/edit`}
                  className="icon-button"
                  title="Edit application"
                  aria-label={`Edit ${job.company} application`}
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer note */}
      <p className="fine-print">
        Your dashboard statistics are calculated from your
        saved applications. Add or update applications to
        keep your progress current.
      </p>

    </div>
  );
}