import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";
import { listCommunities, notificationSummary } from "../api/collaboration";
import NotificationBell from "./NotificationBell";
import { getInitials } from "../utils/decisionHelpers";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0); const [canModerate, setCanModerate] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => notificationSummary().then(({ data }) => { if (active) setUnread(data.unread || 0); }).catch(() => {});
    refresh();
    listCommunities().then(({ data }) => { if (active) setCanModerate(user?.role === "ADMIN" || data.some((community) => ["OWNER", "MODERATOR"].includes(community.memberRole))); }).catch(() => {});
    window.addEventListener("decisionhub:notifications-changed", refresh);
    return () => { active = false; window.removeEventListener("decisionhub:notifications-changed", refresh); };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandMark />
        <div className="brand-name">DecisionHub</div>
        <NotificationBell />
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>⌂ &nbsp;Dashboard</NavLink>
        <NavLink to="/boards" className={({ isActive }) => isActive ? "active" : ""}>◈ &nbsp;Decision Boards</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "active" : ""}>▤ &nbsp;Analytics</NavLink>
        <NavLink to="/communities" className={({ isActive }) => isActive ? "active" : ""}>◎ &nbsp;Communities</NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}> <span className="notification-nav-icon" aria-hidden="true">♢{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</span>Notifications</NavLink>
        {canModerate && <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>⚑ &nbsp;Moderation</NavLink>}
        <div className="nav-label">Account</div>
        <NavLink to="/boards/new" className={({ isActive }) => isActive ? "active" : ""}>+ &nbsp;New Board</NavLink>
        <NavLink to="/feedback" className={({ isActive }) => isActive ? "active" : ""}>✎ &nbsp;Feedback</NavLink>
      </nav>

      <div className="sidebar-foot">
        <div className="avatar">{getInitials(user?.fullName || "?")}</div>
        <div style={{ flex: 1 }}>
          <div className="name">{user?.fullName || "Guest"}</div>
          <div className="role">{(user?.role || "USER").replace("_", " ").toLowerCase()}</div>
          <button type="button" className="sidebar-logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
