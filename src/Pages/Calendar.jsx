import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  BriefcaseBusiness
} from "lucide-react";

import { useJobs } from "../context/JobsContext";

// Format a date as YYYY-MM-DD using local time
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Format a date for display
function formatDate(dateString) {
  if (!dateString) return "Date not available";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Get short month name
function getShortMonth(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
}

export default function CalendarPage() {
  const { jobs } = useJobs();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  const [selectedDate, setSelectedDate] = useState(
    () => dateKey(new Date())
  );

  // Get all applications that have an interview date
  const interviews = useMemo(() => {
    return jobs
      .filter((job) => Boolean(job.interviewDate))
      .sort((a, b) =>
        a.interviewDate.localeCompare(b.interviewDate)
      );
  }, [jobs]);

  // Group interviews by date
  const interviewsByDate = useMemo(() => {
    const grouped = {};

    interviews.forEach((job) => {
      if (!grouped[job.interviewDate]) {
        grouped[job.interviewDate] = [];
      }

      grouped[job.interviewDate].push(job);
    });

    return grouped;
  }, [interviews]);

  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Sunday = 0
    const startingDay = firstDay.getDay();

    const days = [];

    // Blank cells before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      days.push({
        day,
        key: dateKey(date),
        isToday: dateKey(date) === dateKey(new Date())
      });
    }

    // Complete the final week
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  // Interviews on the currently selected date
  const selectedInterviews =
    interviewsByDate[selectedDate] || [];

  // Upcoming interviews, including today's interviews
  const todayKey = dateKey(new Date());

  const upcomingInterviews = interviews.filter(
    (job) => job.interviewDate >= todayKey
  );

  // Navigate between months
  function changeMonth(amount) {
    setCurrentMonth((previous) => {
      return new Date(
        previous.getFullYear(),
        previous.getMonth() + amount,
        1
      );
    });
  }

  // Return to the current month and date
  function goToToday() {
    const today = new Date();

    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(dateKey(today));
  }

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            INTERVIEW PLANNER
          </span>

          <h1>Interview Calendar</h1>

          <p>
            Keep track of your scheduled interviews and upcoming
            career opportunities.
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
            <CalendarDays size={20} />
          </div>

          <p>Total Scheduled</p>

          <div className="stat-number">
            {interviews.length}
          </div>

          <span className="stat-note">
            Applications with interview dates
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon green">
            <Clock size={20} />
          </div>

          <p>Upcoming Interviews</p>

          <div className="stat-number">
            {upcomingInterviews.length}
          </div>

          <span className="stat-note">
            Today and future dates
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon blue">
            <BriefcaseBusiness size={20} />
          </div>

          <p>Companies</p>

          <div className="stat-number">
            {
              new Set(
                interviews.map((job) => job.company)
              ).size
            }
          </div>

          <span className="stat-note">
            With scheduled interviews
          </span>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon orange">
            <CalendarDays size={20} />
          </div>

          <p>This Month</p>

          <div className="stat-number">
            {
              interviews.filter((job) => {
                const date = new Date(
                  `${job.interviewDate}T00:00:00`
                );

                return (
                  !Number.isNaN(date.getTime()) &&
                  date.getFullYear() ===
                    currentMonth.getFullYear() &&
                  date.getMonth() ===
                    currentMonth.getMonth()
                );
              }).length
            }
          </div>

          <span className="stat-note">
            Interviews in the selected month
          </span>
        </div>

      </div>

      {/* Main calendar and selected-date details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.8fr)",
          gap: "18px",
          alignItems: "start"
        }}
        className="calendar-layout"
      >

        {/* Calendar */}
        <section className="panel panel-pad">

          <div className="section-title">
            <div>
              <h2>
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </h2>

              <p>
                Select any date to view its interviews.
              </p>
            </div>

            <div style={{ display: "flex", gap: "5px" }}>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={goToToday}
              >
                Today
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* Weekday names */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "5px",
              marginBottom: "8px"
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    fontSize: "11px",
                    color: "#85869b",
                    fontWeight: 700
                  }}
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* Calendar dates */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "5px"
            }}
          >
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{ minHeight: "65px" }}
                  />
                );
              }

              const dateInterviews =
                interviewsByDate[date.key] || [];

              const isSelected =
                selectedDate === date.key;

              return (
                <button
                  key={date.key}
                  type="button"
                  onClick={() => setSelectedDate(date.key)}
                  aria-pressed={isSelected}
                  aria-label={`${date.key}, ${dateInterviews.length} interviews`}
                  style={{
                    minWidth: 0,
                    minHeight: "65px",
                    padding: "7px 3px",
                    border: isSelected
                      ? "2px solid #5b50d6"
                      : date.isToday
                        ? "1px solid #b7b1ff"
                        : "1px solid #ececf4",
                    borderRadius: "9px",
                    background: isSelected
                      ? "#eeecff"
                      : "#ffffff",
                    color: isSelected
                      ? "#5148bd"
                      : "#414257",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "7px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: date.isToday ? 800 : 600
                    }}
                  >
                    {date.day}
                  </span>

                  <span
                    style={{
                      display: "flex",
                      gap: "3px",
                      alignItems: "center"
                    }}
                  >
                    {dateInterviews.slice(0, 3).map((job) => (
                      <span
                        key={job.id}
                        title={`${job.company}: ${job.role}`}
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#5b50d6",
                          display: "inline-block"
                        }}
                      />
                    ))}
                  </span>

                  {dateInterviews.length > 0 && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#5b50d6",
                        fontWeight: 700
                      }}
                    >
                      {dateInterviews.length} interview
                      {dateInterviews.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              marginTop: "18px",
              fontSize: "11px",
              color: "#85869b"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#5b50d6"
              }}
            />
            Scheduled interview
          </div>

        </section>

        {/* Selected date details */}
        <section className="panel panel-pad">

          <div className="section-title">
            <div>
              <h2>Selected Date</h2>

              <p>
                {formatDate(selectedDate)}
              </p>
            </div>

            <CalendarDays
              size={20}
              className="muted-icon"
            />
          </div>

          {selectedInterviews.length === 0 ? (
            <div className="empty-mini">
              <CalendarDays size={28} />

              <strong>No interviews on this date</strong>

              <p>
                Select another date or add an interview date
                to an application.
              </p>

              <Link to="/applications">
                Manage applications
              </Link>
            </div>
          ) : (
            <div className="calendar-list">
              {selectedInterviews.map((job) => (
                <div
                  className="calendar-event"
                  key={job.id}
                >
                  <div className="company-avatar">
                    {job.company
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>

                  <div className="calendar-event-info">
                    <h3>{job.company}</h3>

                    <p>{job.role}</p>

                    {job.location && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "6px"
                        }}
                      >
                        <MapPin size={12} />
                        {job.location}
                      </span>
                    )}

                    <div style={{ marginTop: "9px" }}>
                      <span className="status-badge status-interview">
                        Interview scheduled
                      </span>
                    </div>

                    <Link
                      to={`/applications/${job.id}/edit`}
                      className="inline-link"
                      style={{ marginTop: "11px" }}
                    >
                      Edit application
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>

      {/* Upcoming interview list */}
      <section className="panel panel-pad">

        <div className="section-title">
          <div>
            <h2>Upcoming Interviews</h2>

            <p>
              Your next scheduled interview dates.
            </p>
          </div>

          <Link
            to="/applications"
            className="inline-link"
          >
            Applications
            <ChevronRight size={14} />
          </Link>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="empty-state">
            <div className="round-icon">
              <CalendarDays size={23} />
            </div>

            <h3>No upcoming interviews</h3>

            <p>
              Add an interview date to one of your applications
              to display it here.
            </p>

            <Link
              to="/applications"
              className="button button-primary"
            >
              Manage Applications
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {upcomingInterviews.slice(0, 10).map((job) => (
              <div
                className="recent-row"
                key={job.id}
              >
                <div className="date-tile">
                  <strong>
                    {
                      new Date(
                        `${job.interviewDate}T00:00:00`
                      ).getDate()
                    }
                  </strong>

                  <span>
                    {getShortMonth(job.interviewDate)}
                  </span>
                </div>

                <div className="recent-main">
                  <strong>{job.company}</strong>

                  <span>{job.role}</span>
                </div>

                <span className="recent-date">
                  {formatDate(job.interviewDate)}
                </span>

                <Link
                  to={`/applications/${job.id}/edit`}
                  className="button button-secondary button-small"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}

      </section>

      <p className="fine-print">
        Interview dates are taken from your saved job applications.
        The calendar does not create external calendar events or send reminders.
      </p>

    </div>
  );
}