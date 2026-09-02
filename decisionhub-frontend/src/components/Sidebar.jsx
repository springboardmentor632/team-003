import React from "react";
import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandMark />
        <div className="brand-name">DecisionHub</div>
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>⌂ &nbsp;Dashboard</NavLink>
        <NavLink to="/boards" className={({ isActive }) => isActive ? "active" : ""}>◈ &nbsp;Decision Boards</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "active" : ""}>▤ &nbsp;Analytics</NavLink>
        <NavLink to="/communities" className={({ isActive }) => isActive ? "active" : ""}>◎ &nbsp;Communities</NavLink>
        <div className="nav-label">Account</div>
        <NavLink to="/boards/new" className={({ isActive }) => isActive ? "active" : ""}>+ &nbsp;New Board</NavLink>
      </nav>

      <div className="sidebar-foot" onClick={logout} title="Log out">
        <div className="avatar">{initials(user?.fullName || "?")}</div>
        <div>
          <div className="name">{user?.fullName || "Guest"}</div>
          <div className="role">{(user?.role || "USER").replace("_", " ").toLowerCase()}</div>
        </div>
      </div>
    </aside>
  );
}
