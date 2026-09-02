import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { listMyDecisions, listPublicDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

const CATEGORY_COLORS = ["var(--teal)", "var(--brass)", "var(--coral)", "#5B7FA6", "#8A6BB1", "#4E9A6B"];

export default function Analytics() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listMyDecisions({ size: 100 }), listPublicDecisions({ size: 100 })])
      .then(([mine, pub]) => {
        const byId = new Map();
        [...(mine.data.content || []), ...(pub.data.content || [])].forEach((d) => byId.set(d.id, d));
        setDecisions([...byId.values()]);
      })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load analytics")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="state-block">Crunching the numbers…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  const totalVotes = decisions.reduce((s, d) => s + (d.totalVotes || 0), 0);
  const avgParticipation = decisions.length
    ? Math.round((decisions.filter((d) => d.totalVotes > 0).length / decisions.length) * 100)
    : 0;

  const votesByCategory = {};
  decisions.forEach((d) => { votesByCategory[d.category] = (votesByCategory[d.category] || 0) + (d.totalVotes || 0); });
  const categoryEntries = Object.entries(votesByCategory).sort((a, b) => b[1] - a[1]);
  const maxCategoryVotes = Math.max(1, ...categoryEntries.map(([, v]) => v));

  const categoryDonutTotal = categoryEntries.reduce((s, [, v]) => s + v, 0) || 1;
  let cumulativeDeg = 0;
  const donutStops = categoryEntries.map(([name, v], i) => {
    const startDeg = cumulativeDeg;
    const deg = (v / categoryDonutTotal) * 360;
    cumulativeDeg += deg;
    return { name, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], startDeg, endDeg: cumulativeDeg };
  });
  const donutGradient = donutStops.length
    ? `conic-gradient(${donutStops.map((s) => `${s.color} ${s.startDeg}deg ${s.endDeg}deg`).join(", ")})`
    : "var(--line)";

  const mostActive = [...decisions].sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0)).slice(0, 5);
  const maxVotes = Math.max(1, ...mostActive.map((d) => d.totalVotes || 0));

  const pollTypeCounts = {};
  decisions.forEach((d) => { pollTypeCounts[d.pollType] = (pollTypeCounts[d.pollType] || 0) + 1; });
  const pollTypeEntries = Object.entries(pollTypeCounts).sort((a, b) => b[1] - a[1]);
  const maxPollType = Math.max(1, ...pollTypeEntries.map(([, v]) => v));

  return (
    <div>
      <TopBar eyebrow="Insights" title="Decision analytics" subtitle="Participation, trends, and outcomes across your boards." />

      <div className="stats">
        <div className="stat"><div className="num display">{decisions.length}</div><div className="lbl">Boards visible to you</div></div>
        <div className="stat"><div className="num display">{totalVotes}</div><div className="lbl">Total votes cast</div></div>
        <div className="stat"><div className="num display">{avgParticipation}%</div><div className="lbl">Boards with at least one vote</div></div>
        <div className="stat"><div className="num display">{decisions.filter((d) => d.closed).length}</div><div className="lbl">Decisions reached</div></div>
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <h3>Votes by category</h3>
          {categoryEntries.length === 0 ? (
            <div className="empty-note">No votes yet.</div>
          ) : (
            <div className="bars">
              {categoryEntries.map(([name, votes], i) => (
                <div className="bar-col" key={name}>
                  <div className="bar" style={{ height: `${(votes / maxCategoryVotes) * 100}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Decisions by category</h3>
          <div className="donut" style={{ background: donutGradient }} />
          <div className="legend">
            {donutStops.map((s) => (
              <div key={s.name}><span className="sw" style={{ background: s.color }} />{s.name} — {Math.round(((s.endDeg - s.startDeg) / 360) * 100)}%</div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Most active decision boards</h3>
        {mostActive.length === 0 ? (
          <div className="empty-note">No boards yet.</div>
        ) : (
          <div className="rank-list">
            {mostActive.map((d, i) => (
              <div className="rank-row" key={d.id}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span>{d.title}</span>
                <div className="track"><div className="fill" style={{ width: `${((d.totalVotes || 0) / maxVotes) * 100}%` }} /></div>
                <span className="v">{d.totalVotes}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-grid" style={{ marginTop: 18 }}>
        <div className="panel">
          <h3>Poll types used</h3>
          <div className="rank-list">
            {pollTypeEntries.map(([type, count]) => (
              <div className="rank-row" key={type}>
                <span className="n">—</span>
                <span>{type.replace("_", " ").toLowerCase()}</span>
                <div className="track"><div className="fill" style={{ width: `${(count / maxPollType) * 100}%` }} /></div>
                <span className="v">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Visibility mix</h3>
          <div className="rank-list">
            {["PUBLIC", "PRIVATE"].map((vis) => {
              const count = decisions.filter((d) => d.visibility === vis).length;
              return (
                <div className="rank-row" key={vis}>
                  <span className="n">—</span>
                  <span>{vis === "PUBLIC" ? "Public boards" : "Private boards"}</span>
                  <div className="track"><div className="fill" style={{ width: decisions.length ? `${(count / decisions.length) * 100}%` : "0%" }} /></div>
                  <span className="v">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
