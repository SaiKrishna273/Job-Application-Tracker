
import axios from "axios";

const API = axios.create({
  baseURL: "https://careerpilot-backend-ppdg.onrender.com",
  headers: {
    "Content-Type": "application/json"
  }
});

// Automatically attach JWT token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jobpilot-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired or invalid authentication
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobpilot-token");
      localStorage.removeItem("jobpilot-user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
