import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChartNoAxesColumn,
  BriefcaseBusiness,
  MessageSquare,
  Trophy,
  Target,
  TrendingUp,
  ArrowRight
} from "lucide-react";

import { useJobs } from "../context/JobsContext";
import { STATUSES } from "../data";

const statusColors = {
  Applied: "fill-applied",
  Assessment: "fill-assessment",
  Interview: "fill-interview",
  Offer: "fill-offer",
  Rejected: "fill-rejected"
};

export default function Analytics() {
  const { jobs } = useJobs();

  const total = jobs.length;

  // Count applications in each status
  const statusCounts = useMemo(() => {
    return STATUSES.map((status) => ({
      status,
      count: jobs.filter(
        (job) => job.status === status
      ).length
    }));
  }, [jobs]);

  const applied = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const assessments = jobs.filter(
    (job) => job.status === "Assessment"
  ).length;

  const interviews = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const offers = jobs.filter(
    (job) => job.status === "Offer"
  ).length;

  const rejected = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  // An application has received a response if it has
  // moved beyond the initial Applied status.
  const responded = total - applied;

  const responseRate = total > 0
    ? Math.round((responded / total) * 100)
    : 0;

  const offerRate = total > 0
    ? Math.round((offers / total) * 100)
    : 0;

  // Conversion to interviews, measured against all applications
  const interviewRate = total > 0
    ? Math.round((interviews / total) * 100)
    : 0;

  const rejectionRate = total > 0
    ? Math.round((rejected / total) * 100)
    : 0;

  // Get applications grouped by company
  const companyStats = useMemo(() => {
    const grouped = {};

    jobs.forEach((job) => {
      const name = job.company?.trim() || "Unknown Company";

      if (!grouped[name]) {
        grouped[name] = {
          company: name,
          total: 0,
          interviews: 0,
          offers: 0
        };
      }

      grouped[name].total += 1;

      if (job.status === "Interview") {
        grouped[name].interviews += 1;
      }

      if (job.status === "Offer") {
        grouped[name].offers += 1;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [jobs]);

  // Highest company application count, used for bar widths
  const maxCompanyApplications = Math.max(
    1,
    ...companyStats.map((company) => company.total)
  );

  // Application status bar percentage
  function getPercentage(count) {
    if (total === 0) return 0;

    return Math.round((count / total) * 100);
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            JOB SEARCH INSIGHTS
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your application progress and
            measure your job-search performance.
          </p>
        </div>

        <Link
          to="/applications"
          className="button button-primary"
        >
          <BriefcaseBusiness size={17} />
          View Applications
        </Link>
      </div>

      {/* Key metrics */}
      <div className="stats-grid">

        {/* Total applications */}
        <div className="panel stat-card">
          <div className="stat-icon purple">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Total Applications</p>

          <div className="stat-number">
            {total}
          </div>

          <span className="stat-note">
            All tracked applications
          </span>
        </div>

        {/* Response rate */}
        <div className="panel stat-card">
          <div className="stat-icon blue">
            <MessageSquare size={20} />
          </div>

          <p>Response Rate</p>

          <div className="stat-number">
            {responseRate}%
          </div>

          <span className="stat-note">
            Applications beyond Applied status
          </span>
        </div>

        {/* Interview rate */}
        <div className="panel stat-card">
          <div className="stat-icon green">
            <Target size={20} />
          </div>

          <p>Interview Rate</p>

          <div className="stat-number">
            {interviewRate}%
          </div>

          <span className="stat-note">
            Applications currently at interview stage
          </span>
        </div>

        {/* Offer rate */}
        <div className="panel stat-card">
          <div className="stat-icon orange">
            <Trophy size={20} />
          </div>

          <p>Offer Rate</p>

          <div className="stat-number">
            {offerRate}%
          </div>

          <span className="stat-note">
            Applications marked as offers
          </span>
        </div>

      </div>

      {/* Status distribution */}
      <section className="panel panel-pad">

        <div className="section-title">
          <div>
            <h2>Application Status Distribution</h2>

            <p>
              See how your applications are spread
              across different stages.
            </p>
          </div>

          <ChartNoAxesColumn
            size={22}
            className="muted-icon"
          />
        </div>

        {total === 0 ? (
          <div className="empty-state">
            <div className="round-icon">
              <ChartNoAxesColumn size={23} />
            </div>

            <h3>No analytics available yet</h3>

            <p>
              Add your first job application to start
              tracking your progress.
            </p>

            <Link
              to="/applications/new"
              className="button button-primary"
            >
              Add Application
            </Link>
          </div>
        ) : (
          <div className="analytics-bars">

            {statusCounts.map((item) => (
              <div
                className="analytics-row"
                key={item.status}
              >
                <div className="analytics-label">
                  <span>{item.status}</span>

                  <strong>
                    {item.count}
                    {" "}
                    <small>
                      ({getPercentage(item.count)}%)
                    </small>
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className={`progress-fill ${
                      statusColors[item.status] || ""
                    }`}
                    style={{
                      width: `${getPercentage(item.count)}%`
                    }}
                  />
                </div>
              </div>
            ))}

          </div>
        )}

      </section>

      {/* Performance details */}
      <div className="dashboard-grid">

        {/* Conversion summary */}
        <section className="panel panel-pad">

          <div className="section-title">
            <div>
              <h2>Job Search Performance</h2>

              <p>
                A breakdown of your current progress.
              </p>
            </div>

            <TrendingUp
              size={21}
              className="muted-icon"
            />
          </div>

          <div className="pipeline-list">

            <div>
              <div className="pipeline-meta">
                <span>Applications submitted</span>
                <strong>{applied}</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill fill-applied"
                  style={{
                    width: `${getPercentage(applied)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="pipeline-meta">
                <span>Assessments</span>
                <strong>{assessments}</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill fill-assessment"
                  style={{
                    width: `${getPercentage(assessments)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="pipeline-meta">
                <span>Interviews</span>
                <strong>{interviews}</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill fill-interview"
                  style={{
                    width: `${getPercentage(interviews)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="pipeline-meta">
                <span>Offers</span>
                <strong>{offers}</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill fill-offer"
                  style={{
                    width: `${getPercentage(offers)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="pipeline-meta">
                <span>Rejected</span>
                <strong>{rejected}</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill fill-rejected"
                  style={{
                    width: `${getPercentage(rejected)}%`
                  }}
                />
              </div>
            </div>

          </div>

        </section>

        {/* Company statistics */}
        <section className="panel panel-pad">

          <div className="section-title">
            <div>
              <h2>Company Activity</h2>

              <p>
                Companies with the most tracked applications.
              </p>
            </div>

            <Link
              to="/companies"
              className="inline-link"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {companyStats.length === 0 ? (
            <div className="empty-mini">
              <BriefcaseBusiness size={27} />

              <strong>No company activity yet</strong>

              <p>
                Your company statistics will appear
                after you add applications.
              </p>
            </div>
          ) : (
            <div className="pipeline-list">

              {companyStats.map((company) => (
                <div key={company.company}>

                  <div className="pipeline-meta">
                    <span>{company.company}</span>

                    <strong>{company.total}</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill fill-applied"
                      style={{
                        width: `${
                          (company.total /
                            maxCompanyApplications) * 100
                        }%`
                      }}
                    />
                  </div>

                  <span
                    className="stat-note"
                    style={{
                      display: "block",
                      marginTop: "5px"
                    }}
                  >
                    {company.interviews} interview-stage
                    {" · "}
                    {company.offers} offers
                  </span>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>

      {/* Helpful note */}
      <div className="notice">
        <strong>Understanding your metrics</strong>

        <p>
          Response rate counts applications that have moved
          beyond Applied status. Interview rate counts
          applications currently marked Interview, and offer
          rate counts applications marked Offer. These
          metrics use your current statuses, not a historical
          record of every stage you previously reached.
        </p>
      </div>

      <p className="fine-print">
        All analytics are calculated from your saved
        applications. No external job-market data is used.
      </p>

    </div>
  );
}