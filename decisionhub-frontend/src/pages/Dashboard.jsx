import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { useAuth } from "../context/AuthContext";
import { listMyDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";
import { timeAgo } from "../utils/decisionHelpers";

function dateValue(decision) {
  const date = new Date(decision.createdAt || decision.updatedAt || 0).getTime();
  return Number.isNaN(date) ? 0 : date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyDecisions({ size: 50 })
      .then(({ data }) => setDecisions(data.content || data || []))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load your decisions")))
      .finally(() => setLoading(false));
  }, []);

  const { active, resolved, recent, totalVotes } = useMemo(() => {
    const activeBoards = decisions.filter((decision) => !decision.closed).sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));
    const resolvedBoards = decisions.filter((decision) => decision.closed);
    const recentBoards = [...decisions].sort((a, b) => dateValue(b) - dateValue(a) || (b.id || 0) - (a.id || 0));
    return {
      active: activeBoards,
      resolved: resolvedBoards,
      recent: recentBoards,
      totalVotes: decisions.reduce((sum, decision) => sum + (decision.totalVotes || 0), 0),
    };
  }, [decisions]);

  const firstName = (user?.fullName || "there").split(" ")[0];

  return (
    <div>
      <TopBar
        eyebrow={`Workspace overview · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
        title={`Good to see you, ${firstName}.`}
        subtitle="Keep momentum on the decisions that need your attention, then see what your workspace is deciding next."
        action={<Link to="/boards/new"><button className="btn brass">+ New decision board</button></Link>}
      />

      <div className="stats dashboard-stats">
        <div className="stat"><div className="num display">{active.length}</div><div className="lbl">Open decisions</div></div>
        <div className="stat"><div className="num display">{totalVotes}</div><div className="lbl">Votes recorded</div></div>
        <div className="stat"><div className="num display">{resolved.length}</div><div className="lbl">Decisions reached</div></div>
        <div className="stat"><div className="num display">{decisions.length}</div><div className="lbl">Boards created</div></div>
      </div>

      <section className="dashboard-section">
        <div className="section-head dashboard-section-head">
          <div>
            <span className="eyebrow">Needs attention</span>
            <h2>Active decisions</h2>
          </div>
          <Link className="section-link" to="/boards">Explore all boards <span>→</span></Link>
        </div>

        {loading ? (
          <div className="state-block">Loading your boards…</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : active.length === 0 ? (
          <div className="state-block dashboard-empty">
            <span className="empty-icon">◈</span>
            <h3>No active decisions yet</h3>
            <p>Create a board to start comparing options and gathering votes.</p>
            <Link to="/boards/new"><button className="btn brass">Create a board</button></Link>
          </div>
        ) : (
          <div className="card-grid dashboard-card-grid">
            {active.slice(0, 4).map((decision) => <DecisionCard key={decision.id} decision={decision} />)}
          </div>
        )}
      </section>

      {!loading && !error && decisions.length > 0 && (
        <section className="dashboard-section recent-section">
          <div className="section-head dashboard-section-head">
            <div>
              <span className="eyebrow">Latest in your workspace</span>
              <h2>Recently created</h2>
            </div>
            <Link className="section-link" to="/boards">View board library <span>→</span></Link>
          </div>
          <div className="recent-boards">
            {recent.slice(0, 5).map((decision) => (
              <Link to={`/boards/${decision.id}`} className="recent-board-row" key={decision.id}>
                <span className={`recent-status ${decision.closed ? "closed" : "open"}`} />
                <div className="recent-main">
                  <h3>{decision.title}</h3>
                  <p>{decision.category || "General"} <span>·</span> {decision.createdByName || decision.createdBy || "Your workspace"}</p>
                </div>
                <div className="recent-meta">
                  <span>{decision.totalVotes || 0} votes</span>
                  <time>{timeAgo(decision.createdAt) || "Recently added"}</time>
                </div>
                <span className="recent-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
