
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import API from "../services/api";

const JobsContext = createContext(null);

// Convert MySQL response into the existing React format
function formatJob(application) {
  return {
    id: application.application_id,
    company: application.company_name,
    role: application.job_role,
    location: application.location || "",
    date: application.application_date || "",
    status: application.status || "Applied",
    salary: application.salary || "",
    notes: application.notes || "",
    link: application.job_link || "",
    interviewDate: application.interview_date || ""
  };
}

// Convert React form data into Flask API format
function formatPayload(job) {
  return {
    company_name: job.company,
    job_role: job.role,
    location: job.location || "",
    salary: job.salary || "",
    application_date: job.date || null,
    status: job.status || "Applied",
    notes: job.notes || "",
    job_link: job.link || "",
    interview_date: job.interviewDate || null
  };
}

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch applications belonging to the logged-in user
  async function refreshJobs() {
    const token = localStorage.getItem("jobpilot-token");

    if (!token) {
      setJobs([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.get("/applications");

      const applications = response.data.applications || [];

      setJobs(applications.map(formatJob));

    } catch (err) {
      console.error("Fetch applications error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load applications and listen for login/logout changes
  useEffect(() => {
    refreshJobs();

    const handleAuthChange = () => {
      refreshJobs();
    };

    window.addEventListener(
      "jobpilot-auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "jobpilot-auth-changed",
        handleAuthChange
      );
    };
  }, []);

  // Add application
  async function addJob(job) {
    try {
      setError("");

      const response = await API.post(
        "/applications",
        formatPayload(job)
      );

      const newJob = {
        ...job,
        id: response.data.application_id
      };

      setJobs((previousJobs) => [
        newJob,
        ...previousJobs
      ]);

      return newJob;

    } catch (err) {
      console.error("Add application error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to add application."
      );

      throw err;
    }
  }

  // Update application
  async function updateJob(id, changes) {
    const existingJob = jobs.find(
      (job) => String(job.id) === String(id)
    );

    if (!existingJob) {
      throw new Error("Application not found.");
    }

    const updatedJob = {
      ...existingJob,
      ...changes
    };

    try {
      setError("");

      await API.put(
        `/applications/${id}`,
        formatPayload(updatedJob)
      );

      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          String(job.id) === String(id)
            ? updatedJob
            : job
        )
      );

      return updatedJob;

    } catch (err) {
      console.error("Update application error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to update application."
      );

      throw err;
    }
  }

  // Delete application
  async function deleteJob(id) {
    try {
      setError("");

      await API.delete(`/applications/${id}`);

      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => String(job.id) !== String(id)
        )
      );

    } catch (err) {
      console.error("Delete application error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to delete application."
      );

      throw err;
    }
  }

  // Clear applications from the current screen
  function clearJobs() {
    setJobs([]);
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        setJobs,
        loading,
        error,
        refreshJobs,
        addJob,
        updateJob,
        deleteJob,
        clearJobs
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

// Custom hook
export function useJobs() {
  const context = useContext(JobsContext);

  if (!context) {
    throw new Error(
      "useJobs must be used inside JobsProvider"
    );
  }

  return context;
}
