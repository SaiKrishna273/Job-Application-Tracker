import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { JobsProvider } from "./context/JobsContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Kanban from "./pages/Kanban";
import CalendarPage from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Companies from "./pages/Companies";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";

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