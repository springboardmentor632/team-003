import React from "react";
import NotificationBell from "./NotificationBell";

export default function TopBar({ eyebrow, title, subtitle, action }) {
  return (
    <div className="topbar">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <NotificationBell />
        {action}
      </div>
    </div>
  );
}
