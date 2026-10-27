import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  ArrowUpDown,
  ArrowLeft
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";

import JobForm from "../components/JobForm";
import JobTable from "../components/JobTable";
import { useJobs } from "../context/JobsContext";
import { STATUSES } from "../data";

export default function Applications() {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob
  } = useJobs();

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Determine whether we are adding or editing
  const isAdding = location.pathname.endsWith("/new");
  const isEditing = Boolean(id);
  const isFormPage = isAdding || isEditing;

  // Find the application being edited
  const existingJob = isEditing
    ? jobs.find((job) => String(job.id) === String(id))
    : null;

  // Search, filter, and sort applications
  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.company,
          job.role,
          job.location,
          job.status
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      const matchesStatus =
        statusFilter === "All" ||
        job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.date || "").localeCompare(b.date || "");

        case "company":
          return (a.company || "").localeCompare(b.company || "");

        case "role":
          return (a.role || "").localeCompare(b.role || "");

        case "newest":
        default:
          return (b.date || "").localeCompare(a.date || "");
      }
    });

    return result;
  }, [jobs, search, statusFilter, sortBy]);

  // Add or update a job application
  function handleSave(formData) {
    if (isEditing && existingJob) {
      updateJob(existingJob.id, formData);
    } else if (isAdding) {
      addJob(formData);
    } else {
      return;
    }

    navigate("/applications");
  }

  // Update the application status
  function handleStatusChange(jobId, newStatus) {
    updateJob(jobId, { status: newStatus });
  }

  // Delete an application
  function handleDelete(jobId) {
    deleteJob(jobId);
  }

  // Cancel adding or editing
  function handleCancel() {
    navigate("/applications");
  }

  // Form page: add or edit
  if (isFormPage) {
    if (isEditing && !existingJob) {
      return (
        <div className="page-stack">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                JOB MANAGEMENT
              </span>

              <h1>Application not found</h1>

              <p>
                This job application may have been deleted.
              </p>
            </div>
          </div>

          <div className="panel panel-pad">
            <Link
              to="/applications"
              className="button button-primary"
            >
              <ArrowLeft size={16} />
              Back to Applications
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              JOB MANAGEMENT
            </span>

            <h1>
              {isEditing
                ? "Edit Application"
                : "Add Application"}
            </h1>

            <p>
              {isEditing
                ? "Update the details of your job application."
                : "Record a new opportunity in your job search."}
            </p>
          </div>
        </div>

        <JobForm
          key={existingJob?.id ?? "new-application"}
          initialJob={existingJob}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Main applications list
  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            JOB SEARCH MANAGEMENT
          </span>

          <h1>Applications</h1>

          <p>
            Manage, organize, and track all your job applications.
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

      {/* Application summary */}
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
            All tracked opportunities
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon blue">
            <Search size={20} />
          </div>

          <p>Currently Showing</p>

          <div className="stat-number">
            {filteredJobs.length}
          </div>

          <span className="stat-note">
            Applications matching your filters
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon green">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Interview Stage</p>

          <div className="stat-number">
            {
              jobs.filter(
                (job) => job.status === "Interview"
              ).length
            }
          </div>

          <span className="stat-note">
            Applications at interview stage
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon orange">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Offers Received</p>

          <div className="stat-number">
            {
              jobs.filter(
                (job) => job.status === "Offer"
              ).length
            }
          </div>

          <span className="stat-note">
            Applications marked as offers
          </span>
        </div>

      </div>

      {/* Applications table */}
      <section className="panel">

        {/* Search and filters */}
        <div className="toolbar">

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search company, role, location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search applications"
            />
          </div>

          <div className="toolbar-filters">

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter by application status"
            >
              <option value="All">All statuses</option>

              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              aria-label="Sort applications"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A–Z</option>
              <option value="role">Job role A–Z</option>
            </select>

            <ArrowUpDown
              size={16}
              className="muted-icon"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="table-caption">
          Showing {filteredJobs.length} of {jobs.length} applications
        </div>

        {/* Table component */}
        <JobTable
          jobs={filteredJobs}
          onStatusChange={handleStatusChange}
          onEdit={(job) =>
            navigate(`/applications/${job.id}/edit`)
          }
          onDelete={handleDelete}
        />

      </section>

      <p className="fine-print">
        Changes are saved in your browser using LocalStorage.
      </p>

    </div>
  );
}