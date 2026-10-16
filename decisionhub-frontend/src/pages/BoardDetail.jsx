import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDecision, castVote, retractVote, addCriteria, removeCriteria, updateOptionCriteriaScore } from "../api/decisions";
import { reportDecision } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { resolveFileUrl } from "../api/files";
import { saveDecision, unsaveDecision, getSavedDecisionIds } from "../api/user";
import { useAuth } from "../context/AuthContext";
import Discussion from "../components/Discussion";
import Suggestions from "../components/Suggestions";
import Attachments from "../components/Attachments";

const STANDARD_FACTORS = [
  { key: "costScore", label: "Cost", isCustom: false },
  { key: "benefitsScore", label: "Benefits", isCustom: false },
  { key: "riskScore", label: "Risk", isCustom: false },
  { key: "timeScore", label: "Time", isCustom: false },
  { key: "convenienceScore", label: "Convenience", isCustom: false },
];

function DotRow({ score }) {
  const filled = score ? Math.round(score / 2) : 0;
  return (
    <div className="dot-row">
      {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`dot ${i <= filled ? "fill" : ""}`} />)}
    </div>
  );
}

export default function BoardDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votedOptionIds, setVotedOptionIds] = useState([]); // session-local: options this user has voted for
  const [votingId, setVotingId] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [showAddCriteriaModal, setShowAddCriteriaModal] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionScores, setNewCriterionScores] = useState({});
  const [savingCriteria, setSavingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState("");

  const canManageCriteria = Boolean(user && decision && (user.role === "ADMIN" || user.name === decision.createdBy || user.email === decision.createdBy));

  const customCriteriaList = Array.from(
    new Set([
      ...(decision?.customCriteria || []),
      ...(decision?.options || []).flatMap((o) => Object.keys(o.customScores || {})),
    ])
  );

  const customFactors = customCriteriaList.map((c) => ({
    key: c,
    label: c,
    isCustom: true,
  }));

  const allFactors = [...STANDARD_FACTORS, ...customFactors];

  const handleAddCriteria = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newCriterionName.trim();
    if (!trimmed) {
      setCriteriaError("Criterion name cannot be blank");
      return;
    }
    setSavingCriteria(true);
    setCriteriaError("");
    try {
      const optionScoresMap = {};
      Object.entries(newCriterionScores).forEach(([optId, score]) => {
        const num = parseInt(score, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) {
          optionScoresMap[optId] = num;
        }
      });
      const { data } = await addCriteria(id, { name: trimmed, scores: optionScoresMap });
      setDecision(data);
      setShowAddCriteriaModal(false);
      setNewCriterionName("");
      setNewCriterionScores({});
    } catch (err) {
      setCriteriaError(extractErrorMessage(err, "Failed to add criterion"));
    } finally {
      setSavingCriteria(false);
    }
  };

  const handleRemoveCriteria = async (criterionName) => {
    if (!window.confirm(`Are you sure you want to remove the criterion "${criterionName}"?`)) return;
    try {
      const { data } = await removeCriteria(id, criterionName);
      setDecision(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to remove criterion"));
    }
  };

  useEffect(() => {
    getSavedDecisionIds()
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setIsSaved(data.includes(Number(id)));
        }
      })
      .catch(() => {});
  }, [id]);

  const toggleBookmark = async () => {
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      if (nextSaved) {
        await saveDecision(id);
      } else {
        await unsaveDecision(id);
      }
    } catch {
      setIsSaved(!nextSaved);
    } finally {
      setBookmarkBusy(false);
    }
  };

  const load = () => {
    setLoading(true);
    getDecision(id)
      .then(({ data }) => setDecision(data))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load this decision board")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleVote = async (optionId, rating) => {
    setVotingId(optionId);
    setError("");
    try {
      const { data } = await castVote(id, { optionId, rating });
      setDecision(data);
      if (decision?.pollType === "SINGLE_CHOICE") {
        setVotedOptionIds([optionId]);
      } else {
        setVotedOptionIds((prev) => [...new Set([...prev, optionId])]);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't record your vote"));
    } finally {
      setVotingId(null);
    }
  };

  const handleRetract = async (optionId) => {
    setVotingId(optionId);
    try {
      const { data } = await retractVote(id, optionId);
      setDecision(data);
      setVotedOptionIds((prev) => prev.filter((oid) => oid !== optionId));
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't remove your vote"));
    } finally {
      setVotingId(null);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    try {
      await reportDecision(id, { reason: reportReason });
      setReportReason(""); setReporting(false);
    } catch (err) { setError(extractErrorMessage(err, "Couldn't submit report")); }
  };

  if (loading) return <div className="state-block">Loading board…</div>;
  if (error && !decision) return <div className="error-banner">{error}</div>;
  if (!decision) return null;

  const options = decision.options || [];
  const leadingId = decision.totalVotes > 0 ? options.find((o) => o.rank === 1)?.id : null;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link>
        <span> / </span>
        <Link to="/boards" style={{ color: "inherit", textDecoration: "none" }}>Decision boards</Link>
        <span> / </span>
        <b>{decision.title}</b>
      </div>

      {decision.imageUrl && (
        <div className="board-cover-wrap" style={{ marginBottom: 24, borderRadius: "var(--radius)", overflow: "hidden", maxHeight: 320, border: "1px solid var(--line)", background: "var(--paper-raised)" }}>
          <img
            src={resolveFileUrl(decision.imageUrl)}
            alt={decision.title}
            style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }}
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      <div className="detail-head">
        <div>
          <h1 className="display">{decision.title}</h1>
          {decision.description && <p className="detail-description">{decision.description}</p>}
          <div className="tag-row">
            <span className="tag">{decision.visibility === "PUBLIC" ? "Public board" : "Private board"}</span>
            <span className="tag">{decision.totalVotes} votes</span>
            <span className="tag">{decision.pollType?.replace("_", " ").toLowerCase()}</span>
            {decision.closed && <span className="tag">Closed</span>}
          </div>
        </div>
        <div className="detail-actions">
          <button
            type="button"
            className={`btn ${isSaved ? "brass" : "ghost"}`}
            onClick={toggleBookmark}
            disabled={bookmarkBusy}
            title={isSaved ? "Remove from saved boards" : "Save this board"}
          >
            {isSaved ? "★ Saved" : "☆ Save for later"}
          </button>
          <a className="btn ghost" href="#attachments">Attachments</a>
          <a className="btn ghost" href="#discussion">Discussion</a>
          <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share board</button>
          <button className="btn ghost" onClick={() => setReporting((value) => !value)}>Report</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {reporting && <form className="form-card" onSubmit={submitReport} style={{ marginBottom: 20 }}><div className="field"><label>Why are you reporting this board?</label><input value={reportReason} required onChange={(event) => setReportReason(event.target.value)} placeholder="Describe the issue" /></div><div className="detail-actions"><button className="btn brass" type="submit">Submit report</button><button className="btn ghost" type="button" onClick={() => setReporting(false)}>Cancel</button></div></form>}

      <div className="detail-body">
        <div>
          <div className="compare-grid">
            {options.map((opt) => {
              const isLeading = opt.id === leadingId;
              const hasVoted = votedOptionIds.includes(opt.id);
              const isBusy = votingId === opt.id;

              return (
                <div className={`opt-card ${isLeading ? "leading" : ""}`} key={opt.id}>
                  {opt.imageUrl && (
                    <div className="opt-img-wrap" style={{ marginBottom: 14, borderRadius: "var(--radius)", overflow: "hidden", maxHeight: 180, border: "1px solid var(--line)" }}>
                      <img
                        src={resolveFileUrl(opt.imageUrl)}
                        alt={opt.title}
                        style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
                        onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="opt-card-head">
                    <h3>{opt.title}</h3>
                    {isLeading && <span className="lead-badge">Leading</span>}
                  </div>

                  <div className="opt-score mono">
                    {opt.averageScore != null ? `Weighted score — ${opt.averageScore.toFixed(1)} / 10` : "No comparison scores yet"}
                    {decision.pollType === "RATING" && opt.averageRating != null && ` · Avg. rating ${opt.averageRating.toFixed(1)} / 5`}
                  </div>

                  {opt.pros && <div className="pc-row"><span className="pc-label pros">+ Pro</span><span>{opt.pros}</span></div>}
                  {opt.cons && <div className="pc-row"><span className="pc-label cons">− Con</span><span>{opt.cons}</span></div>}

                  {decision.pollType === "RATING" ? (
                    <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          className="btn ghost"
                          style={{ flex: 1, padding: "9px 0" }}
                          disabled={isBusy || decision.closed}
                          onClick={() => handleVote(opt.id, n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      <button
                        className={`vote-btn ${hasVoted ? "voted" : ""}`}
                        disabled={isBusy || decision.closed}
                        onClick={() => handleVote(opt.id)}
                      >
                        {isBusy ? "Voting…" : hasVoted ? "✓ You voted for this" : "Vote for this option"}
                      </button>
                      {hasVoted && decision.pollType === "MULTIPLE_CHOICE" && (
                        <button
                          type="button"
                          className="remove-link"
                          style={{ marginTop: 8 }}
                          onClick={() => handleRetract(opt.id)}
                        >
                          Remove your vote
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison by criteria with user-defined dynamic criteria */}
          <div style={{ marginTop: 28, background: "var(--card-bg, #fff)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 18, margin: 0, color: "var(--ink)" }}>Comparison by criteria</h2>
                <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Standard factors & user-defined custom evaluation criteria</span>
              </div>
              {canManageCriteria && !decision.closed && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => { setShowAddCriteriaModal((prev) => !prev); setCriteriaError(""); }}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {showAddCriteriaModal ? "Cancel" : "+ Add custom criterion"}
                </button>
              )}
            </div>

            {/* Inline Criterion Addition Form */}
            {showAddCriteriaModal && (
              <form onSubmit={handleAddCriteria} style={{ marginBottom: 18, padding: 14, background: "rgba(0,137,123,0.04)", border: "1px solid rgba(0,137,123,0.2)", borderRadius: "var(--radius)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "var(--brass, #00897b)" }}>
                  Add a user-defined criterion to this decision board
                </div>
                {criteriaError && <div className="error-banner" style={{ marginBottom: 10, fontSize: 12 }}>{criteriaError}</div>}
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <input
                    type="text"
                    required
                    value={newCriterionName}
                    onChange={(e) => setNewCriterionName(e.target.value)}
                    placeholder="Criterion name (e.g. Scalability, Security, UX)"
                    style={{ flex: "1 1 200px" }}
                  />
                  <button type="submit" className="btn brass" disabled={savingCriteria} style={{ padding: "8px 16px", fontSize: 12 }}>
                    {savingCriteria ? "Saving…" : "Save criterion"}
                  </button>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 6 }}>
                  Option scores for this criterion (1–10 optional):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {options.map((opt) => (
                    <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {opt.title}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newCriterionScores[opt.id] ?? ""}
                        onChange={(e) => setNewCriterionScores((prev) => ({ ...prev, [opt.id]: e.target.value }))}
                        placeholder="1-10"
                        style={{ width: 64, padding: "4px 8px", fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </form>
            )}

            <div style={{ overflowX: "auto" }}>
              <table className="criteria-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr>
                    <th>Criteria</th>
                    {options.map((opt) => <th key={opt.id}>{opt.title}</th>)}
                    {canManageCriteria && <th style={{ width: 80, textAlign: "center" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {allFactors.map((f) => (
                    <tr key={f.key}>
                      <td>
                        <strong>{f.label}</strong>
                        {f.isCustom && (
                          <span style={{ fontSize: 10, marginLeft: 6, padding: "2px 6px", background: "rgba(0,137,123,0.12)", color: "var(--brass, #00897b)", borderRadius: 10, fontWeight: 600 }}>
                            Custom
                          </span>
                        )}
                      </td>
                      {options.map((opt) => {
                        const score = f.isCustom ? opt.customScores?.[f.key] : opt[f.key];
                        return (
                          <td className="score" key={opt.id}>
                            <DotRow score={score} />
                            {score != null && <span style={{ fontSize: 11, marginLeft: 6, color: "var(--ink-soft)" }}>({score}/10)</span>}
                          </td>
                        );
                      })}
                      {canManageCriteria && (
                        <td style={{ textAlign: "center" }}>
                          {f.isCustom ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveCriteria(f.key)}
                              style={{ background: "none", border: "none", color: "var(--red, #e53935)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, padding: "2px 6px" }}
                              title={`Delete ${f.label}`}
                            >
                              Delete
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Standard</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Discussion boardId={id} />
          <Suggestions boardId={id} />
          <div id="attachments">
            <Attachments
              boardId={id}
              options={options}
              canManage={user?.fullName === decision.createdByName || user?.role === "ADMIN"}
            />
          </div>
        </div>

        <aside className="rail">
          <div className="rail-panel">
            <h4>Board info</h4>
            <div className="rail-meta"><span className="k">Created by</span><span>{decision.createdByName}</span></div>
            <div className="rail-meta"><span className="k">Category</span><span>{decision.category}</span></div>
            <div className="rail-meta"><span className="k">Visibility</span><span>{decision.visibility === "PUBLIC" ? "Public" : "Private"}</span></div>
            <div className="rail-meta"><span className="k">Poll type</span><span>{decision.pollType?.replace("_", " ").toLowerCase()}</span></div>
            <div className="rail-meta"><span className="k">Anonymous voting</span><span>{decision.allowAnonymousVoting ? "Allowed" : "Not allowed"}</span></div>
          </div>

          <div className="rail-panel">
            <h4>Vote breakdown</h4>
            {options.map((opt) => {
              const pct = decision.totalVotes > 0 ? Math.round((opt.voteCount / decision.totalVotes) * 100) : 0;
              return (
                <div className="voter-row" key={opt.id}>
                  <span className="who">{opt.title}</span>
                  <span className={`pick ${opt.id === leadingId ? "a" : "b"}`}>{pct}% · {opt.voteCount}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
