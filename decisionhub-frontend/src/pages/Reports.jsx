import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { listReports, setCommentHidden, updateReport } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Reports() {
  const [reports, setReports] = useState([]); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const load = () => listReports("PENDING").then(({ data }) => setReports(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load the moderation queue")));
  useEffect(() => { load(); }, []);
  const resolve = async (id, status) => { try { await updateReport(id, status); setReports((items) => items.filter((item) => item.id !== id)); setSuccess(status === "REVIEWED" ? "Report resolved." : "Report dismissed."); } catch (err) { setError(extractErrorMessage(err, "Couldn't update report")); } };
  const hide = async (report, value) => { if (!report.comment?.id || !report.decisionId) return; try { await setCommentHidden(report.decisionId, report.comment.id, value); setSuccess(value ? "Comment hidden." : "Comment restored."); } catch (err) { setError(extractErrorMessage(err, "Couldn't update comment visibility")); } };
  return <div><TopBar eyebrow="Moderation" title="Moderation queue" subtitle="Review reports and keep community decisions constructive." />{success && <div className="success-note">{success}</div>}{error && <div className="error-banner">{error}</div>}{reports.length === 0 ? <div className="state-block"><h3>Nothing needs review</h3><p>The moderation queue is clear.</p></div> : <div className="panel"><div className="recent-boards">{reports.map((report) => <div className="recent-board-row" key={report.id}><span className="recent-status open" /><div className="recent-main"><h3>{report.decisionTitle || "Decision report"}</h3><p>{report.reason}</p>{report.commentBody && <p><b>Reported comment:</b> {report.commentBody}</p>}</div><div className="detail-actions">{report.comment?.id && <button className="btn ghost" onClick={() => hide(report, !report.comment.hidden)}>{report.comment.hidden ? "Unhide" : "Hide"}</button>}<button className="btn ghost" onClick={() => resolve(report.id, "DISMISSED")}>Dismiss</button><button className="btn brass" onClick={() => resolve(report.id, "REVIEWED")}>Resolve</button></div></div>)}</div></div>}</div>;
}
