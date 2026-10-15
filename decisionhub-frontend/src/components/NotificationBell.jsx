import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listNotifications, markNotificationRead, notificationSummary } from "../api/collaboration";
import { notificationInitials, timeAgo } from "../utils/decisionHelpers";

export default function NotificationBell() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState([]); const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const refresh = () => Promise.all([listNotifications(), notificationSummary()]).then(([list, summary]) => { setItems(list.data.slice(0, 5)); setUnread(summary.data.unread || 0); }).catch(() => {});
  useEffect(() => { refresh(); window.addEventListener("decisionhub:notifications-changed", refresh); return () => window.removeEventListener("decisionhub:notifications-changed", refresh); }, []);
  useEffect(() => { const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const read = async (item) => { if (!item.read) { await markNotificationRead(item.id); await refresh(); window.dispatchEvent(new Event("decisionhub:notifications-changed")); } setOpen(false); };
  return <div className="notification-bell" ref={ref}><button type="button" className="bell-button" onClick={() => { setOpen((value) => !value); if (!open) refresh(); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open}>♢{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</button>
    {open && <div className="notification-dropdown"><div className="notification-dropdown-head"><strong>Notifications</strong><Link to="/notifications" onClick={() => setOpen(false)}>View all</Link></div>{items.length ? items.map((item) => <Link key={item.id} to={item.decisionId ? `/boards/${item.decisionId}` : "/dashboard"} className={`notification-item ${item.read ? "" : "unread"}`} onClick={() => read(item)}><div className="avatar notification-avatar" aria-hidden="true">{notificationInitials(item)}</div><div style={{ flex: 1, minWidth: 0 }}><p>{item.message}</p><small>{timeAgo(item.createdAt)}</small></div><span /></Link>) : <p className="empty-note">You’re all caught up.</p>}</div>}
  </div>;
}
