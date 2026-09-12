import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { listReports, updateReport } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Reports() {
  const [reports, setReports] = useState([]); const [error, setError] = useState("");
  const load = () => listReports("PENDING").then(({ data }) => setReports(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load the moderation queue")));
  useEffect(() => { load(); }, []);
  const resolve = async (id, status) => { try { await updateReport(id, status); setReports((items) => items.filter((item) => item.id !== id)); } catch (err) { setError(extractErrorMessage(err, "Couldn't update report")); } };
  return <div><TopBar eyebrow="Admin" title="Moderation queue" subtitle="Review reports and keep community decisions constructive." />{error && <div className="error-banner">{error}</div>}{reports.length === 0 ? <div className="state-block"><h3>Nothing needs review</h3><p>The moderation queue is clear.</p></div> : <div className="panel"><div className="recent-boards">{reports.map((report) => <div className="recent-board-row" key={report.id}><span className="recent-status open" /><div className="recent-main"><h3>{report.decision?.title || "Decision report"}</h3><p>{report.reason}</p></div><div className="detail-actions"><button className="btn ghost" onClick={() => resolve(report.id, "DISMISSED")}>Dismiss</button><button className="btn brass" onClick={() => resolve(report.id, "REVIEWED")}>Resolve</button></div></div>)}</div></div>}</div>;
}
