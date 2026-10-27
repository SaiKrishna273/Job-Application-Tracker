// All possible job application statuses
export const STATUSES = [
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected"
];

// Sample job application data
export const starterJobs = [
  {
    id: 101,
    company: "Infosys",
    role: "Python Developer",
    location: "Hyderabad",
    date: "2026-10-24",
    status: "Applied",
    link: "https://www.infosys.com",
    notes: "Applied through careers page",
    salary: "4-6 LPA",
    interviewDate: ""
  },

  {
    id: 102,
    company: "TCS",
    role: "Software Developer",
    location: "Bengaluru",
    date: "2026-10-22",
    status: "Interview",
    link: "https://www.tcs.com",
    notes: "Technical round",
    salary: "4-7 LPA",
    interviewDate: "2026-11-02"
  },

  {
    id: 103,
    company: "Wipro",
    role: "Frontend Developer",
    location: "Remote",
    date: "2026-10-20",
    status: "Rejected",
    link: "",
    notes: "",
    salary: "5-8 LPA",
    interviewDate: ""
  },

  {
    id: 104,
    company: "Accenture",
    role: "Associate Software Engineer",
    location: "Hyderabad",
    date: "2026-10-18",
    status: "Assessment",
    link: "",
    notes: "Online assessment pending",
    salary: "4-6 LPA",
    interviewDate: ""
  },

  {
    id: 105,
    company: "Microsoft",
    role: "Frontend Engineer",
    location: "Bengaluru",
    date: "2026-10-15",
    status: "Offer",
    link: "",
    notes: "Offer received",
    salary: "12-18 LPA",
    interviewDate: ""
  }
];