import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { listReports, setCommentHidden, updateReport } from "../api/collaboration";
import { listMyDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("moderation");
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = () =>
    listReports("PENDING")
      .then(({ data }) => setReports(data))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load the moderation queue")));

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id, status) => {
    try {
      await updateReport(id, status);
      setReports((items) => items.filter((item) => item.id !== id));
      setSuccess(status === "REVIEWED" ? "Report resolved." : "Report dismissed.");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update report"));
    }
  };

  const hide = async (report, value) => {
    if (!report.comment?.id || !report.decisionId) return;
    try {
      await setCommentHidden(report.decisionId, report.comment.id, value);
      setSuccess(value ? "Comment hidden." : "Comment restored.");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update comment visibility"));
    }
  };

  const handleExportJson = async () => {
    setExporting(true);
    setError("");
    try {
      const { data } = await listMyDecisions({ page: 0, size: 100 });
      const records = data?.content || (Array.isArray(data) ? data : []);
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decisionhub-decisions-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess("Exported decision dataset to JSON successfully.");
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to export decisions"));
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError("");
    try {
      const { data } = await listMyDecisions({ page: 0, size: 100 });
      const items = data?.content || (Array.isArray(data) ? data : []);
      if (!items.length) {
        setError("No decision records found to export.");
        return;
      }
      const headers = ["ID", "Title", "Category", "Visibility", "Votes", "Created At"];
      const rows = items.map((d) => [
        d.id,
        `"${(d.title || "").replace(/"/g, '""')}"`,
        `"${d.category || ""}"`,
        d.visibility || "",
        d.totalVotes || 0,
        `"${d.createdAt || ""}"`,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decisionhub-decisions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess("Exported decision dataset to CSV successfully.");
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to export decisions"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <TopBar
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: "Reports & Exports" },
        ]}
        eyebrow="Analysis & Governance"
        title="Reports & Moderation"
        subtitle="Review community flags, maintain deliberation standards, and export decision records."
      />

      <div className="boards-controls" style={{ marginBottom: 20 }}>
        <div className="board-tabs">
          <button
            type="button"
            className={activeTab === "moderation" ? "active" : ""}
            onClick={() => setActiveTab("moderation")}
          >
            Moderation Queue ({reports.length})
          </button>
          <button
            type="button"
            className={activeTab === "exports" ? "active" : ""}
            onClick={() => setActiveTab("exports")}
          >
            Data & Polling Exports
          </button>
        </div>
      </div>

      {success && <div className="success-note">{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {activeTab === "moderation" && (
        <>
          {reports.length === 0 ? (
            <div className="state-block">
              <h3>Nothing needs review</h3>
              <p>The moderation queue is clear. All community decisions and discussions are in good standing.</p>
            </div>
          ) : (
            <div className="panel">
              <div className="recent-boards">
                {reports.map((report) => (
                  <div className="recent-board-row" key={report.id}>
                    <span className="recent-status open" />
                    <div className="recent-main">
                      <h3>{report.decisionTitle || "Decision report"}</h3>
                      <p>{report.reason}</p>
                      {report.commentBody && (
                        <p>
                          <b>Reported comment:</b> {report.commentBody}
                        </p>
                      )}
                    </div>
                    <div className="detail-actions">
                      {report.comment?.id && (
                        <button
                          className="btn ghost"
                          onClick={() => hide(report, !report.comment.hidden)}
                        >
                          {report.comment.hidden ? "Unhide" : "Hide"}
                        </button>
                      )}
                      <button
                        className="btn ghost"
                        onClick={() => resolve(report.id, "DISMISSED")}
                      >
                        Dismiss
                      </button>
                      <button
                        className="btn brass"
                        onClick={() => resolve(report.id, "REVIEWED")}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "exports" && (
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <article className="card">
            <div className="card-top">
              <span className="cat">Structured Data</span>
              <span className="lead-badge">Ready</span>
            </div>
            <h3>Decision Boards & Votes (CSV)</h3>
            <p>
              Download a tabular spreadsheet summary of your decision boards, including participation metrics, categories, and visibility flags.
            </p>
            <div className="card-foot" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn brass"
                onClick={handleExportCsv}
                disabled={exporting}
              >
                {exporting ? "Generating CSV…" : "Download CSV Spreadsheet"}
              </button>
            </div>
          </article>

          <article className="card">
            <div className="card-top">
              <span className="cat">Raw Machine Format</span>
              <span className="lead-badge">Ready</span>
            </div>
            <h3>Full Decision Objects (JSON)</h3>
            <p>
              Export full decision structures, including all evaluated options, custom criteria scoring, and configuration schemas.
            </p>
            <div className="card-foot" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn ghost"
                onClick={handleExportJson}
                disabled={exporting}
              >
                {exporting ? "Generating JSON…" : "Download JSON Data"}
              </button>
            </div>
          </article>

          <article className="card" style={{ opacity: 0.85, borderStyle: "dashed" }}>
            <div className="card-top">
              <span className="cat">PDF & XLSX Pipelines</span>
              <span className="tag">In Roadmap</span>
            </div>
            <h3>Automated PDF Summary & Excel Workbooks</h3>
            <p>
              Server-side compiled PDF executive summaries and multi-tab Excel workbooks are scheduled for the next backend release. Use CSV and JSON downloads above for immediate analysis.
            </p>
            <div className="card-foot" style={{ marginTop: 20 }}>
              <button type="button" className="btn ghost" disabled>
                Pipeline In Development
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
