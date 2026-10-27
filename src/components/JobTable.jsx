import { useState } from "react";
import {
  ExternalLink,
  Pencil,
  Trash2,
  Briefcase
} from "lucide-react";

import { STATUSES } from "../data";

function formatDate(date) {
  if (!date) return "—";

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

function getStatusClass(status) {
  return `status-${String(status || "applied")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

export default function JobTable({
  jobs = [],
  onStatusChange,
  onEdit,
  onDelete
}) {
  const [deletingId, setDeletingId] = useState(null);

  function handleDelete(job) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the application for ${job.role} at ${job.company}?`
    );

    if (!confirmed) return;

    setDeletingId(job.id);

    try {
      onDelete?.(job.id);
    } finally {
      setDeletingId(null);
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <div className="round-icon">
          <Briefcase size={23} />
        </div>

        <h3>No applications found</h3>

        <p>
          Add a job application or change your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>COMPANY & ROLE</th>
            <th>LOCATION</th>
            <th>APPLIED DATE</th>
            <th>SALARY</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              {/* Company and job role */}
              <td>
                <div className="company-cell">
                  <div className="company-avatar">
                    {job.company?.trim()?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  <div>
                    <strong>{job.company}</strong>

                    <div style={{ marginTop: 5, color: "#85869b" }}>
                      {job.role}
                    </div>
                  </div>
                </div>
              </td>

              {/* Location */}
              <td>{job.location || "Not specified"}</td>

              {/* Application date */}
              <td>{formatDate(job.date)}</td>

              {/* Salary */}
              <td>{job.salary || "—"}</td>

              {/* Status selector */}
              <td>
                <select
                  className="status-select"
                  aria-label={`Change status for ${job.company} - ${job.role}`}
                  value={job.status || "Applied"}
                  onChange={(event) =>
                    onStatusChange?.(
                      job.id,
                      event.target.value
                    )
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 6 }}>
                  <span
                    className={`status-badge ${getStatusClass(job.status)}`}
                  >
                    {job.status || "Applied"}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td>
                <div className="row-actions">
                  {job.link && (
                    <a
                      className="icon-button"
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open job listing"
                      aria-label={`Open job listing for ${job.company}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  <button
                    type="button"
                    className="icon-button"
                    title="Edit application"
                    aria-label={`Edit ${job.company} application`}
                    onClick={() => onEdit?.(job)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="icon-button danger-icon"
                    title="Delete application"
                    aria-label={`Delete ${job.company} application`}
                    disabled={deletingId === job.id}
                    onClick={() => handleDelete(job)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}