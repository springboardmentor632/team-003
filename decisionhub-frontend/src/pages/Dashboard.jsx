import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { useAuth } from "../context/AuthContext";
import { listMyDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyDecisions({ size: 50 })
      .then(({ data }) => setDecisions(data.content || []))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load your decisions")))
      .finally(() => setLoading(false));
  }, []);

  const active = decisions.filter((d) => !d.closed);
  const resolved = decisions.filter((d) => d.closed);
  const totalVotes = decisions.reduce((sum, d) => sum + (d.totalVotes || 0), 0);
  const firstName = (user?.fullName || "there").split(" ")[0];

  return (
    <div>
      <TopBar
        eyebrow={`Good to see you, ${firstName}`}
        title="Your decision boards"
        subtitle="Compare options, gather votes, and let your communities help you decide."
        action={<Link to="/boards/new"><button className="btn brass">+ New decision board</button></Link>}
      />

      <div className="stats">
        <div className="stat"><div className="num display">{active.length}</div><div className="lbl">Active decisions</div></div>
        <div className="stat"><div className="num display">{totalVotes}</div><div className="lbl">Total votes across your boards</div></div>
        <div className="stat"><div className="num display">{resolved.length}</div><div className="lbl">Decisions reached</div></div>
        <div className="stat"><div className="num display">{decisions.length}</div><div className="lbl">Boards created</div></div>
      </div>

      <div className="section-head">
        <h2>Open for voting</h2>
        <Link to="/boards" style={{ fontSize: 12.5, color: "var(--ink-soft)", textDecoration: "underline" }}>View all boards</Link>
      </div>

      {loading ? (
        <div className="state-block">Loading your boards…</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : active.length === 0 ? (
        <div className="state-block">
          <h3>No active decisions yet</h3>
          <p>Create your first board to start comparing options and collecting votes.</p>
        </div>
      ) : (
        <div className="card-grid">
          {active.slice(0, 4).map((d) => <DecisionCard key={d.id} decision={d} />)}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <div className="section-head">
            <h2>Recently decided</h2>
          </div>
          <div className="mini-list">
            {resolved.slice(0, 5).map((d) => {
              const winner = [...(d.options || [])].sort((a, b) => b.voteCount - a.voteCount)[0];
              const winnerPct = d.totalVotes > 0 && winner ? Math.round((winner.voteCount / d.totalVotes) * 100) : 0;
              return (
                <Link to={`/boards/${d.id}`} key={d.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="mini-card">
                    <div className="mc-left">
                      <h4>{d.title}</h4>
                      <div className="mc-meta">{d.category} · {d.totalVotes} votes</div>
                    </div>
                    {winner && (
                      <div className="mc-winner">
                        <div className="w-name">{winner.title}</div>
                        <div className="w-pct mono">{winnerPct}% support</div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
