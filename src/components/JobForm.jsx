import { useEffect, useState } from "react";
import { STATUSES } from "../data";

const blankForm = () => ({
  company: "",
  role: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Applied",
  link: "",
  notes: "",
  salary: "",
  interviewDate: ""
});

export default function JobForm({
  initialJob,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState(
    initialJob || blankForm()
  );

  // Update the form when editing a different application
  useEffect(() => {
    setForm(initialJob || blankForm());
  }, [initialJob]);

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  }

  // Submit the form
  function handleSubmit(event) {
    event.preventDefault();

    if (!form.company.trim() || !form.role.trim()) {
      return;
    }

    onSave({
      ...form,
      company: form.company.trim(),
      role: form.role.trim()
    });
  }

  return (
    <form
      className="job-form panel"
      onSubmit={handleSubmit}
    >
      <div className="section-title">
        <div>
          <h2>
            {initialJob
              ? "Edit application"
              : "Add application"}
          </h2>

          <p>
            Keep your job search details in one place.
          </p>
        </div>
      </div>

      <div className="form-grid">

        {/* Company name */}
        <label>
          Company name *
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. Infosys"
            required
          />
        </label>

        {/* Job title */}
        <label>
          Job title *
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="e.g. React Developer"
            required
          />
        </label>

        {/* Location */}
        <label>
          Location
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Hyderabad / Remote"
          />
        </label>

        {/* Application date */}
        <label>
          Application date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        {/* Application status */}
        <label>
          Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            {STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>

        {/* Interview date */}
        <label>
          Interview date
          <input
            type="date"
            name="interviewDate"
            value={form.interviewDate || ""}
            onChange={handleChange}
          />
        </label>

        {/* Salary */}
        <label>
          Expected salary
          <input
            type="text"
            name="salary"
            value={form.salary || ""}
            onChange={handleChange}
            placeholder="e.g. 5–7 LPA"
          />
        </label>

        {/* Job link */}
        <label>
          Job link
          <input
            type="url"
            name="link"
            value={form.link || ""}
            onChange={handleChange}
            placeholder="https://..."
          />
        </label>

        {/* Additional notes */}
        <label className="full-field">
          Notes
          <textarea
            name="notes"
            value={form.notes || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Recruiter details, next steps, or notes..."
          />
        </label>

      </div>

      {/* Form buttons */}
      <div className="form-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="button button-primary"
          type="submit"
        >
          {initialJob
            ? "Save changes"
            : "Add application"}
        </button>
      </div>
    </form>
  );
}