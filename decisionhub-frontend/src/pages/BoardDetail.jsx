import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDecision, castVote, retractVote } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

const FACTORS = [
  { key: "costScore", label: "Cost" },
  { key: "benefitsScore", label: "Benefits" },
  { key: "riskScore", label: "Risk" },
  { key: "timeScore", label: "Time" },
  { key: "convenienceScore", label: "Convenience" },
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
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votedOptionIds, setVotedOptionIds] = useState([]); // session-local: options this user has voted for
  const [votingId, setVotingId] = useState(null);

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

  if (loading) return <div className="state-block">Loading board…</div>;
  if (error && !decision) return <div className="error-banner">{error}</div>;
  if (!decision) return null;

  const options = decision.options || [];
  const leadingId = decision.totalVotes > 0 ? options.find((o) => o.rank === 1)?.id : null;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/boards" style={{ color: "inherit", textDecoration: "none" }}>Decision boards</Link> / {decision.category} / <b>{decision.title}</b>
      </div>

      <div className="detail-head">
        <div>
          <h1 className="display">{decision.title}</h1>
          <div className="tag-row">
            <span className="tag">{decision.visibility === "PUBLIC" ? "Public board" : "Private board"}</span>
            <span className="tag">{decision.totalVotes} votes</span>
            <span className="tag">{decision.pollType.replace("_", " ").toLowerCase()}</span>
            {decision.closed && <span className="tag">Closed</span>}
          </div>
        </div>
        <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share board</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-body">
        <div>
          <div className="compare-grid">
            {options.map((opt) => {
              const isLeading = opt.id === leadingId;
              const hasVoted = votedOptionIds.includes(opt.id);
              const isBusy = votingId === opt.id;

              return (
                <div className={`opt-card ${isLeading ? "leading" : ""}`} key={opt.id}>
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

          {options.some((o) => o.costScore != null || o.benefitsScore != null || o.riskScore != null) && (
            <>
              <div className="section-head"><h2>Comparison by criteria</h2></div>
              <table className="criteria-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    {options.map((opt) => <th key={opt.id}>{opt.title}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {FACTORS.map((f) => (
                    <tr key={f.key}>
                      <td>{f.label}</td>
                      {options.map((opt) => (
                        <td className="score" key={opt.id}><DotRow score={opt[f.key]} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="section-head"><h2>Discussion</h2></div>
          <div className="discussion">
            <div className="empty-note">
              Comments and community discussion for this board are coming in a future update.
            </div>
          </div>
        </div>

        <aside className="rail">
          <div className="rail-panel">
            <h4>Board info</h4>
            <div className="rail-meta"><span className="k">Created by</span><span>{decision.createdByName}</span></div>
            <div className="rail-meta"><span className="k">Category</span><span>{decision.category}</span></div>
            <div className="rail-meta"><span className="k">Visibility</span><span>{decision.visibility === "PUBLIC" ? "Public" : "Private"}</span></div>
            <div className="rail-meta"><span className="k">Poll type</span><span>{decision.pollType.replace("_", " ").toLowerCase()}</span></div>
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
