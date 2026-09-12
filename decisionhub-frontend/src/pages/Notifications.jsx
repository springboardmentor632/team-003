import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import { listNotifications, markNotificationRead } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { timeAgo } from "../utils/decisionHelpers";

export default function Notifications() {
  const [items, setItems] = useState([]); const [error, setError] = useState("");
  useEffect(() => { listNotifications().then(({ data }) => setItems(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load notifications"))); }, []);
  const read = async (item) => { if (!item.read) { const { data } = await markNotificationRead(item.id); setItems((all) => all.map((entry) => entry.id === item.id ? data : entry)); } };
  return <div><TopBar eyebrow="Stay in the loop" title="Notifications" subtitle="Updates from the decisions and conversations you follow." />{error && <div className="error-banner">{error}</div>}{items.length === 0 ? <div className="state-block"><h3>You’re all caught up</h3><p>Votes and comments on your boards will show up here.</p></div> : <div className="panel"><div className="recent-boards">{items.map((item) => <Link key={item.id} className="recent-board-row" to={item.decisionId ? `/boards/${item.decisionId}` : "/dashboard"} onClick={() => read(item)}><span className={`recent-status ${item.read ? "closed" : "open"}`} /><div className="recent-main"><h3>{item.message}</h3><p>{item.type.toLowerCase()} <span>·</span> {timeAgo(item.createdAt)}</p></div><span className="recent-arrow">→</span></Link>)}</div></div>}</div>;
}
