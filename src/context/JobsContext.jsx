import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { starterJobs } from "../data";

// Create context
const JobsContext = createContext(null);

// Provider component
export function JobsProvider({ children }) {

  // Load saved applications from LocalStorage
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem("jobpilot-jobs");

      return saved === null
        ? starterJobs
        : JSON.parse(saved);

    } catch (error) {
      console.error("Error loading jobs:", error);
      return starterJobs;
    }
  });

  // Save applications whenever the jobs state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "jobpilot-jobs",
        JSON.stringify(jobs)
      );
    } catch (error) {
      console.error("Could not save jobs:", error);
    }
  }, [jobs]);

  // Add a new application
  const addJob = (job) => {
    setJobs((previousJobs) => [
      ...previousJobs,
      {
        ...job,
        id: Date.now()
      }
    ]);
  };

  // Update an existing application
  const updateJob = (id, changes) => {
    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        String(job.id) === String(id)
          ? { ...job, ...changes }
          : job
      )
    );
  };

  // Delete an application
  const deleteJob = (id) => {
    setJobs((previousJobs) =>
      previousJobs.filter(
        (job) => String(job.id) !== String(id)
      )
    );
  };

  // Delete all applications
  const clearJobs = () => {
    setJobs([]);
  };

  return (
    <JobsContext.Provider
      value={{
        jobs,
        setJobs,
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

// Custom hook to access job data
export function useJobs() {
  const context = useContext(JobsContext);

  if (!context) {
    throw new Error(
      "useJobs must be used inside JobsProvider"
    );
  }

  return context;
}