import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Plus,
  ExternalLink
} from "lucide-react";

import { useJobs } from "../context/JobsContext";
import { STATUSES } from "../data";

const statusClasses = {
  Applied: "dot-applied",
  Assessment: "dot-assessment",
  Interview: "dot-interview",
  Offer: "dot-offer",
  Rejected: "dot-rejected"
};

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

export default function Kanban() {
  const { jobs, updateJob } = useJobs();

  const [draggedJobId, setDraggedJobId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Start dragging a job card
  function handleDragStart(event, job) {
    setDraggedJobId(job.id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      String(job.id)
    );
  }

  // Allow a card to be dropped into a column
  function handleDragOver(event, status) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  // Update the application when dropped
  function handleDrop(event, newStatus) {
    event.preventDefault();

    const transferredId =
      event.dataTransfer.getData("text/plain");

    const jobId = transferredId || draggedJobId;

    if (jobId !== null && jobId !== "") {
      const job = jobs.find(
        (item) => String(item.id) === String(jobId)
      );

      if (job && job.status !== newStatus) {
        updateJob(job.id, {
          status: newStatus
        });
      }
    }

    setDraggedJobId(null);
    setDragOverStatus(null);
  }

  function handleDragEnd() {
    setDraggedJobId(null);
    setDragOverStatus(null);
  }

  // Support changing status without dragging
  function handleStatusChange(jobId, newStatus) {
    updateJob(jobId, {
      status: newStatus
    });
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            APPLICATION WORKFLOW
          </span>

          <h1>Kanban Board</h1>

          <p>
            Move your applications between stages
            to track your job search progress.
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

      {/* Summary */}
      <div className="stats-grid">
        <div className="panel stat-card">
          <div className="stat-icon purple">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Total Applications</p>

          <div className="stat-number">
            {jobs.length}
          </div>

          <span className="stat-note">
            Across all stages
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon blue">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Applied</p>

          <div className="stat-number">
            {
              jobs.filter(
                (job) => job.status === "Applied"
              ).length
            }
          </div>

          <span className="stat-note">
            Applications submitted
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon green">
            <CalendarDays size={20} />
          </div>

          <p>Interviews</p>

          <div className="stat-number">
            {
              jobs.filter(
                (job) => job.status === "Interview"
              ).length
            }
          </div>

          <span className="stat-note">
            At interview stage
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon orange">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Offers</p>

          <div className="stat-number">
            {
              jobs.filter(
                (job) => job.status === "Offer"
              ).length
            }
          </div>

          <span className="stat-note">
            Offers received
          </span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="kanban-board">
        {STATUSES.map((status) => {
          const columnJobs = jobs.filter(
            (job) => job.status === status
          );

          return (
            <section
              key={status}
              className="panel kanban-column"
              onDragOver={(event) =>
                handleDragOver(event, status)
              }
              onDrop={(event) =>
                handleDrop(event, status)
              }
              style={{
                background:
                  dragOverStatus === status
                    ? "#f0efff"
                    : "#fafaff",
                outline:
                  dragOverStatus === status
                    ? "2px dashed #5b50d6"
                    : "none"
              }}
            >
              {/* Column heading */}
              <div className="kanban-heading">
                <span
                  className={`kanban-dot ${
                    statusClasses[status] || ""
                  }`}
                />

                <h2>{status}</h2>

                <span className="count-pill">
                  {columnJobs.length}
                </span>
              </div>

              {/* Application cards */}
              <div className="kanban-cards">
                {columnJobs.map((job) => (
                  <article
                    key={job.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(event, job)
                    }
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity:
                        String(draggedJobId) === String(job.id)
                          ? 0.5
                          : 1
                    }}
                  >
                    <div className="kanban-card-top">
                      <div className="company-avatar">
                        {job.company
                          ?.trim()
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      {job.link && (
                        <a
                          className="icon-button"
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open job listing"
                          aria-label={`Open ${job.company} job listing`}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>

                    <h3>{job.role}</h3>

                    <p>{job.company}</p>

                    {job.location && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "10px",
                          color: "#85869b",
                          marginBottom: "10px"
                        }}
                      >
                        <MapPin size={12} />
                        {job.location}
                      </div>
                    )}

                    <div className="kanban-card-footer">
                      <span>
                        Applied: {formatDate(job.date)}
                      </span>
                    </div>

                    {job.interviewDate && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#5b50d6",
                          marginTop: "10px"
                        }}
                      >
                        Interview: {formatDate(job.interviewDate)}
                      </div>
                    )}

                    {/* Alternative to drag and drop */}
                    <label
                      style={{
                        display: "grid",
                        gap: "5px",
                        marginTop: "12px",
                        fontSize: "10px",
                        color: "#85869b"
                      }}
                    >
                      Move to stage

                      <select
                        className="status-select"
                        value={job.status || "Applied"}
                        aria-label={`Change ${job.company} status`}
                        onChange={(event) =>
                          handleStatusChange(
                            job.id,
                            event.target.value
                          )
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        {STATUSES.map((option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <Link
                      to={`/applications/${job.id}/edit`}
                      className="inline-link"
                      style={{
                        marginTop: "12px",
                        fontSize: "11px"
                      }}
                    >
                      Edit application
                    </Link>
                  </article>
                ))}

                {/* Empty column */}
                {columnJobs.length === 0 && (
                  <div className="kanban-empty">
                    No applications
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="fine-print">
        Drag a card into another column or use its status
        dropdown. Your changes are saved automatically.
      </p>

    </div>
  );
}