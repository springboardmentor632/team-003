import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";
import { listCommunities, notificationSummary } from "../api/collaboration";
import NotificationBell from "./NotificationBell";
import { getInitials, getAvatarUrl } from "../utils/decisionHelpers";

function IconDashboard() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconDecisions() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconCommunities() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconDiscussions() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="6" x2="15" y2="6" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}



function IconFeedback() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconGearSolid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L8.91 5.767a8.558 8.558 0 00-1.782 1.028L5.3 5.922a1.875 1.875 0 00-2.226.596l-1.079 1.868a1.875 1.875 0 00.377 2.274l1.523 1.341a8.625 8.625 0 000 2.057l-1.523 1.341a1.875 1.875 0 00-.377 2.274l1.079 1.868c.503.872 1.574 1.233 2.226.596l1.828-.873c.563.41 1.163.757 1.782 1.028l.318 1.95a1.875 1.875 0 001.85 1.567h2.158c.917 0 1.699-.663 1.85-1.567l.318-1.95a8.558 8.558 0 001.782-1.028l1.828.873c.652.637 1.723.276 2.226-.596l1.079-1.868a1.875 1.875 0 00-.377-2.274l-1.523-1.341a8.625 8.625 0 000-2.057l1.523-1.341a1.875 1.875 0 00.377-2.274l-1.079-1.868a1.875 1.875 0 00-2.226-.596l-1.828.873a8.558 8.558 0 00-1.782-1.028l-.318-1.95a1.875 1.875 0 00-1.85-1.567h-2.158zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [canModerate, setCanModerate] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      notificationSummary()
        .then(({ data }) => {
          if (active) setUnread(data.unread || 0);
        })
        .catch(() => {});

    refresh();
    listCommunities()
      .then(({ data }) => {
        if (active) {
          setCanModerate(
            user?.role === "ADMIN" ||
              data.some((community) =>
                ["OWNER", "MODERATOR"].includes(community.memberRole)
              )
          );
        }
      })
      .catch(() => {});

    window.addEventListener("decisionhub:notifications-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("decisionhub:notifications-changed", refresh);
    };
  }, [user]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navContent = (
    <>
      <div className="brand">
        <BrandMark />
        <div className="brand-name">DecisionHub</div>
        <div style={{ marginLeft: "auto" }}>
          <NotificationBell />
        </div>
      </div>

      <div style={{ marginTop: 6, marginBottom: 8 }}>
        <Link
          to="/boards/new"
          className="sidebar-cta-btn"
          onClick={() => setMobileOpen(false)}
        >
          <IconPlus />
          <span>New Decision</span>
        </Link>
      </div>

      <nav className="nav">
        <div className="nav-label">Main Workspace</div>
        <NavLink
          to="/demo"
          className={({ isActive }) => (isActive ? "active demo-nav-pill" : "demo-nav-pill")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: "var(--radius)",
            marginBottom: 6,
            background: "rgba(0,137,123,0.08)",
            color: "var(--teal)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ fontSize: 16 }}>🎯</span>
          <span style={{ flex: 1 }}>Interactive Demo</span>
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              background: "var(--teal)",
              color: "#fff",
              borderRadius: 10,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            DEMO
          </span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconDashboard />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/boards"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconDecisions />
          <span>Decision Boards</span>
        </NavLink>

        <NavLink
          to="/communities"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconCommunities />
          <span>Communities</span>
        </NavLink>

        <NavLink
          to="/discussions"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconDiscussions />
          <span>Discussions</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="notification-nav-icon" aria-hidden="true">
            <IconBell />
            {unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}
          </span>
          <span>Notifications</span>
        </NavLink>

        <div className="nav-label">Analysis & Reports</div>
        <NavLink
          to="/analytics"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconAnalytics />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/voting-history"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconHistory />
          <span>Voting History</span>
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <IconFeedback />
          <span>Feedback</span>
        </NavLink>

        {canModerate && (
          <NavLink
            to="/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <IconReports />
            <span>Moderation</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-foot-wrapper">
        <div className="sidebar-user-widget">
          <Link
            to="/settings"
            className="sidebar-user-profile"
            title="Account Settings & Profile"
            onClick={() => setMobileOpen(false)}
          >
            <div className="sidebar-user-avatar" style={{ overflow: "hidden", position: "relative" }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || user?.name || "User"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span>
                  {getInitials(user?.fullName || user?.name || user?.email || "DH")}
                </span>
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.fullName || user?.name || "Member"}>
                {user?.fullName || user?.name || "Member"}
              </span>
              <div className="sidebar-user-sub">
                <span className={`sidebar-role-badge role-${(user?.role || "MEMBER").toLowerCase()}`}>
                  {user?.role === "ADMIN" ? "Admin" : user?.role === "MODERATOR" ? "Mod" : "Member"}
                </span>
                <span className="sidebar-user-email" title={user?.email || ""}>
                  {user?.email || "user@decisionhub.org"}
                </span>
              </div>
            </div>
          </Link>
          <div className="sidebar-user-actions">
            <Link
              to="/settings"
              className="sidebar-gear-btn"
              title="Settings"
              aria-label="Settings"
              onClick={() => setMobileOpen(false)}
            >
              <IconGearSolid />
            </Link>
            <button
              type="button"
              className="sidebar-user-logout-btn"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BrandMark />
          <span className="brand-name" style={{ fontSize: 17 }}>DecisionHub</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <NotificationBell />
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "mobile-drawer-open" : ""}`}>
        {navContent}
      </aside>
    </>
  );
}
