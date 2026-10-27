import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Building2,
  BriefcaseBusiness,
  MapPin,
  ArrowRight,
  Plus,
  Search
} from "lucide-react";

import { useJobs } from "../context/JobsContext";

// Create a CSS class based on the application status
function getStatusClass(status) {
  return `status-${String(status || "Applied")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

export default function Companies() {
  const { jobs } = useJobs();

  const [search, setSearch] = useState("");

  // Group applications by company
  const companies = useMemo(() => {
    const grouped = {};

    jobs.forEach((job) => {
      const companyName =
        job.company?.trim() || "Unknown Company";

      if (!grouped[companyName]) {
        grouped[companyName] = {
          name: companyName,
          applications: [],
          locations: new Set()
        };
      }

      grouped[companyName].applications.push(job);

      if (job.location?.trim()) {
        grouped[companyName].locations.add(
          job.location.trim()
        );
      }
    });

    return Object.values(grouped)
      .map((company) => ({
        ...company,
        locations: Array.from(company.locations)
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [jobs]);

  // Search companies by company name, role, or location
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) => {
      const matchesName = company.name
        .toLowerCase()
        .includes(query);

      const matchesApplications =
        company.applications.some((job) =>
          [
            job.role,
            job.location,
            job.status
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          )
        );

      return matchesName || matchesApplications;
    });
  }, [companies, search]);

  // Overall statistics
  const totalCompanies = companies.length;

  const companiesWithInterviews = companies.filter(
    (company) =>
      company.applications.some(
        (job) => job.status === "Interview"
      )
  ).length;

  const companiesWithOffers = companies.filter(
    (company) =>
      company.applications.some(
        (job) => job.status === "Offer"
      )
  ).length;

  function getInitials(name) {
    const words = name
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "?";
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[1][0]
    ).toUpperCase();
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            COMPANY DIRECTORY
          </span>

          <h1>Companies</h1>

          <p>
            Organize your applications and track opportunities
            across different companies.
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

      {/* Summary cards */}
      <div className="stats-grid">

        <div className="panel stat-card">
          <div className="stat-icon purple">
            <Building2 size={20} />
          </div>

          <p>Total Companies</p>

          <div className="stat-number">
            {totalCompanies}
          </div>

          <span className="stat-note">
            Companies in your tracker
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon blue">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Total Applications</p>

          <div className="stat-number">
            {jobs.length}
          </div>

          <span className="stat-note">
            Applications across all companies
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon green">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Companies with Interviews</p>

          <div className="stat-number">
            {companiesWithInterviews}
          </div>

          <span className="stat-note">
            Companies with interview-stage applications
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon orange">
            <Building2 size={20} />
          </div>

          <p>Companies with Offers</p>

          <div className="stat-number">
            {companiesWithOffers}
          </div>

          <span className="stat-note">
            Companies with applications marked Offer
          </span>
        </div>

      </div>

      {/* Search bar */}
      <section className="panel">

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search companies, roles, locations..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search companies"
            />
          </div>

          <span
            style={{
              color: "#85869b",
              fontSize: "12px"
            }}
          >
            {filteredCompanies.length} companies
          </span>
        </div>

        {/* Company cards */}
        <div style={{ padding: "18px" }}>

          {filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <div className="round-icon">
                <Building2 size={23} />
              </div>

              <h3>
                {companies.length === 0
                  ? "No companies yet"
                  : "No matching companies"}
              </h3>

              <p>
                {companies.length === 0
                  ? "Add your first job application to create your company directory."
                  : "Try searching with another company, role, or location."}
              </p>

              {companies.length === 0 && (
                <Link
                  to="/applications/new"
                  className="button button-primary"
                >
                  <Plus size={16} />
                  Add Application
                </Link>
              )}
            </div>
          ) : (
            <div className="company-grid">

              {filteredCompanies.map((company) => {
                const applicationCount =
                  company.applications.length;

                const interviewCount =
                  company.applications.filter(
                    (job) => job.status === "Interview"
                  ).length;

                const offerCount =
                  company.applications.filter(
                    (job) => job.status === "Offer"
                  ).length;

                return (
                  <article
                    className="panel company-card"
                    key={company.name}
                  >

                    {/* Company header */}
                    <div className="company-card-top">
                      <div className="company-logo-large">
                        {getInitials(company.name)}
                      </div>

                      <span className="count-pill">
                        {applicationCount}{" "}
                        {applicationCount === 1
                          ? "application"
                          : "applications"}
                      </span>
                    </div>

                    <h2>{company.name}</h2>

                    {/* Company locations */}
                    <p>
                      <MapPin size={13} />

                      {company.locations.length > 0
                        ? company.locations.join(", ")
                        : "Location not specified"}
                    </p>

                    {/* Company statistics */}
                    <div className="company-roles">
                      <div>
                        <span>Applications</span>

                        <strong>
                          {applicationCount}
                        </strong>
                      </div>

                      <div>
                        <span>Interviews</span>

                        <strong>
                          {interviewCount}
                        </strong>
                      </div>

                      <div>
                        <span>Offers</span>

                        <strong>
                          {offerCount}
                        </strong>
                      </div>
                    </div>

                    {/* Job roles */}
                    <div
                      style={{
                        display: "grid",
                        gap: "13px"
                      }}
                    >
                      {company.applications.map((job) => (
                        <div key={job.id}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "8px"
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gap: "6px",
                                minWidth: 0
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "12px",
                                  overflowWrap: "anywhere"
                                }}
                              >
                                {job.role}
                              </strong>

                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#85869b"
                                }}
                              >
                                {job.location || "Location not specified"}
                              </span>
                            </div>

                            <span
                              className={`status-badge ${getStatusClass(
                                job.status
                              )} mini-status`}
                            >
                              {job.status || "Applied"}
                            </span>
                          </div>

                          <Link
                            to={`/applications/${job.id}/edit`}
                            className="inline-link"
                            style={{
                              marginTop: "8px",
                              fontSize: "11px"
                            }}
                          >
                            View application
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      ))}
                    </div>

                  </article>
                );
              })}

            </div>
          )}
        </div>
      </section>

      {/* Footer note */}
      <p className="fine-print">
        Companies are grouped automatically using the company
        names entered in your job applications. Different spellings
        of the same company will appear as separate entries.
      </p>

    </div>
  );
}