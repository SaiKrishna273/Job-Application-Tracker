import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { JobsProvider } from "./context/JobsContext";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Applications from "./Pages/Applications";
import Kanban from "./Pages/Kanban";
import CalendarPage from "./Pages/Calendar";
import Analytics from "./Pages/Analytics";
import Companies from "./Pages/Companies";
import Profile from "./Pages/Profile";
import SettingsPage from "./Pages/Settings";
import Signup from "./Pages/Signup";

// Protect pages that require login
function ProtectedLayout() {
  const user = localStorage.getItem("jobpilot-demo-user");

  return user ? <Layout /> : <Navigate to="/login" replace />;
}

// Main application
export default function App() {
  return (
    <JobsProvider>
      <Routes>
        {/* Login page */}
        <Route
          path="/login"
          element={<Login />}
        />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages */}
        <Route element={<ProtectedLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/applications"
            element={<Applications />}
          />

          <Route
            path="/applications/new"
            element={<Applications />}
          />

          <Route
            path="/applications/:id/edit"
            element={<Applications />}
          />

          <Route
            path="/kanban"
            element={<Kanban />}
          />

          <Route
            path="/calendar"
            element={<CalendarPage />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/companies"
            element={<Companies />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </JobsProvider>
  );
}