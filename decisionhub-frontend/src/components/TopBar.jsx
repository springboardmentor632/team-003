import React from "react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function TopBar({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <header className="topbar">
      <div className="topbar-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="breadcrumb-segment">
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span className={isLast ? "current" : ""}>{crumb.label}</span>
                  )}
                  {!isLast && <span className="breadcrumb-divider">/</span>}
                </span>
              );
            })}
          </nav>
        )}

        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
        {children}
      </div>

      <div className="topbar-actions">
        <NotificationBell />
        {action}
      </div>
    </header>
  );
}
