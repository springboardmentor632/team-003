import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { useAuth } from "../context/AuthContext";
import { listMyDecisions } from "../api/decisions";
import { listCommunities } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { timeAgo, getInitials } from "../utils/decisionHelpers";

function dateValue(decision) {
  const date = new Date(decision.createdAt || decision.updatedAt || 0).getTime();
  return Number.isNaN(date) ? 0 : date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      listMyDecisions({ size: 50 }),
      listCommunities().catch(() => ({ data: [] })),
    ])
      .then(([decisionsRes, communitiesRes]) => {
        if (!active) return;
        const dData = decisionsRes.data;
        setDecisions(dData.content || dData || []);
        setCommunities(Array.isArray(communitiesRes.data) ? communitiesRes.data : []);
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, "Couldn't load your workspace dashboard"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const { active, resolved, recent, totalVotes } = useMemo(() => {
    const activeBoards = decisions.filter((d) => !d.closed).sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));
    const resolvedBoards = decisions.filter((d) => d.closed);
    const recentBoards = [...decisions].sort((a, b) => dateValue(b) - dateValue(a) || (b.id || 0) - (a.id || 0));
    return {
      active: activeBoards,
      resolved: resolvedBoards,
      recent: recentBoards,
      totalVotes: decisions.reduce((sum, d) => sum + (d.totalVotes || 0), 0),
    };
  }, [decisions]);

  const firstName = (user?.fullName || "there").split(" ")[0];

  return (
    <div className="dashboard-container">
      <TopBar
        breadcrumbs={[{ label: "Workspace" }, { label: "Dashboard" }]}
        eyebrow={`Workspace Overview · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
        title={`Good to see you, ${firstName}.`}
        subtitle="Keep momentum on decisions needing your vote, track community deliberations, and propose what your workspace decides next."
        action={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/demo" className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span>🎯</span>
              <span>Interactive Demo</span>
            </Link>
            <Link to="/boards/new">
              <button className="btn brass">+ New Decision Board</button>
            </Link>
          </div>
        }
      />

      {/* Loomio-inspired Overview Metric Strip */}
      <div className="stats dashboard-stats">
        <div className="stat">
          <div className="num display">{active.length}</div>
          <div className="lbl">Open Decisions</div>
        </div>
        <div className="stat">
          <div className="num display">{totalVotes}</div>
          <div className="lbl">Votes Recorded</div>
        </div>
        <div className="stat">
          <div className="num display">{resolved.length}</div>
          <div className="lbl">Decisions Reached</div>
        </div>
        <div className="stat">
          <div className="num display">{decisions.length}</div>
          <div className="lbl">Boards Created</div>
        </div>
      </div>

      {/* Your Communities / Group Hubs */}
      {communities.length > 0 && (
        <section className="dashboard-section communities-hub-section">
          <div className="section-head dashboard-section-head">
            <div>
              <span className="eyebrow">Your Collaborative Groups</span>
              <h2>Active Communities</h2>
            </div>
            <Link className="section-link" to="/communities">
              View all communities <span>→</span>
            </Link>
          </div>

          <div className="dashboard-communities-grid">
            {communities.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/communities/${c.id}`}
                className="dashboard-community-pill"
              >
                <div className="comm-avatar">{getInitials(c.name)}</div>
                <div className="comm-meta">
                  <h4>{c.name}</h4>
                  <p>
                    {c.memberCount || 1} members <span>·</span> {c.decisionCount || 0} decisions
                  </p>
                </div>
                <span className="comm-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Needs Attention / Active Decisions */}
      <section className="dashboard-section">
        <div className="section-head dashboard-section-head">
          <div>
            <span className="eyebrow">Needs Attention</span>
            <h2>Active Decisions</h2>
          </div>
          <Link className="section-link" to="/boards">
            Explore all boards <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="state-block">Loading your boards…</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : active.length === 0 ? (
          <div className="state-block dashboard-empty">
            <span className="empty-icon">◈</span>
            <h3>No active decisions yet</h3>
            <p>Create a board to start comparing options, framing proposals, and gathering votes.</p>
            <Link to="/boards/new">
              <button className="btn brass">Create a board</button>
            </Link>
          </div>
        ) : (
          <div className="card-grid dashboard-card-grid">
            {active.slice(0, 4).map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity Timeline */}
      {!loading && !error && decisions.length > 0 && (
        <section className="dashboard-section recent-section">
          <div className="section-head dashboard-section-head">
            <div>
              <span className="eyebrow">Latest in your workspace</span>
              <h2>Recently Created</h2>
            </div>
            <Link className="section-link" to="/boards">
              View board library <span>→</span>
            </Link>
          </div>
          <div className="recent-boards">
            {recent.slice(0, 5).map((decision) => (
              <Link
                to={`/boards/${decision.id}`}
                className="recent-board-row"
                key={decision.id}
              >
                <span
                  className={`recent-status ${decision.closed ? "closed" : "open"}`}
                />
                <div className="recent-main">
                  <h3>{decision.title}</h3>
                  <p>
                    {decision.category || "General"} <span>·</span>{" "}
                    {decision.createdByName || decision.createdBy || "Your workspace"}
                  </p>
                </div>
                <div className="recent-meta">
                  <span>{decision.totalVotes || 0} votes</span>
                  <time>
                    {timeAgo(decision.createdAt) || "Recently added"}
                  </time>
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
