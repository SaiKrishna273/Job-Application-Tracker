import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import {
  LayoutDashboard,
  Briefcase,
  Columns3,
  CalendarDays,
  ChartNoAxesColumn,
  Building2,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    end: true
  },
  {
    label: "Applications",
    path: "/applications",
    icon: Briefcase
  },
  {
    label: "Kanban Board",
    path: "/kanban",
    icon: Columns3
  },
  {
    label: "Interview Calendar",
    path: "/calendar",
    icon: CalendarDays
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesColumn
  },
  {
    label: "Companies",
    path: "/companies",
    icon: Building2
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserRound
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings
  }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const userEmail =
    localStorage.getItem("jobpilot-demo-user") || "Demo User";

  const displayName = userEmail.includes("@")
    ? userEmail.split("@")[0]
    : userEmail;

  const initials = displayName
    .split(/[._\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  // Close the mobile sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("jobpilot-demo-user");
    closeSidebar();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <Briefcase size={21} />
          </div>

          <span>JobPilot</span>
        </div>

        <div className="nav-caption">
          WORKSPACE
        </div>

        {/* Navigation links */}
        <nav className="side-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User information and logout */}
        <div className="sidebar-bottom">
          <div className="avatar">
            {initials || "D"}
          </div>

          <div className="user-mini">
            <strong>{displayName}</strong>
            <span>Job Seeker</span>
          </div>

          <button
            type="button"
            className="icon-button"
            title="Logout"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-shell">

        {/* Mobile header */}
        <header className="mobile-header">
          <button
            type="button"
            className="icon-button"
            aria-label={
              sidebarOpen
                ? "Close menu"
                : "Open menu"
            }
            onClick={() =>
              setSidebarOpen((previous) => !previous)
            }
          >
            {sidebarOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

          <div className="brand">
            <div className="brand-mark">
              <Briefcase size={18} />
            </div>

            <span>JobPilot</span>
          </div>

          <NavLink
            to="/profile"
            className="avatar"
            aria-label="Open profile"
          >
            {initials || "D"}
          </NavLink>
        </header>

        {/* Current page renders here */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}