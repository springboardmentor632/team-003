import React from "react";

export default function NotificationItem({
  title,
  message,
  time,
  unread = false,
}) {
  return (
    <div
      className="panel"
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        borderLeft: unread ? "3px solid var(--teal)" : undefined,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          minWidth: 38,
          borderRadius: "50%",
          background: "var(--teal-dim)",
          color: "var(--teal)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        !
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <strong>{title}</strong>
          <span className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
            {time}
          </span>
        </div>

        <p className="sub" style={{ marginTop: 5 }}>
          {message}
        </p>
      </div>
    </div>
  );
}