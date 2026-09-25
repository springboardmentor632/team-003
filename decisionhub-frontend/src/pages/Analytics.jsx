import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { analyticsSummary } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

const COLORS = ["var(--teal)", "var(--brass)", "var(--coral)", "#5B7FA6", "#8A6BB1"];

function RankedRows({ values = {}, label }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  return <div className="panel"><h3>{label}</h3>{entries.length === 0 ? <div className="empty-note">Nothing to measure yet.</div> : <div className="rank-list">{entries.map(([name, value], index) => <div className="rank-row" key={name}><span className="n">{String(index + 1).padStart(2, "0")}</span><span>{name.replaceAll("_", " ").toLowerCase()}</span><div className="track"><div className="fill" style={{ width: `${(value / max) * 100}%`, background: COLORS[index % COLORS.length] }} /></div><span className="v">{value}</span></div>)}</div>}</div>;
}

function CategoryVisual({ values = {} }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let offset = 0;
  const stops = entries.map(([, value], index) => {
    const start = total ? (offset / total) * 100 : 0;
    offset += value;
    return `${COLORS[index % COLORS.length]} ${start}% ${(offset / Math.max(1, total)) * 100}%`;
  });
  return <div className="panel analytics-visual"><div className="section-head"><div><span className="eyebrow">Where energy goes</span><h3>Participation mix</h3></div><span className="mono">{total} votes</span></div><div className="donut-layout"><div className="donut" style={{ background: `conic-gradient(${stops.length ? stops.join(", ") : "var(--line) 0 100%"})` }}><div className="donut-hole"><strong>{total}</strong><small>votes</small></div></div><div className="legend">{entries.length ? entries.map(([name, value], index) => <div className="legend-row" key={name}><i style={{ background: COLORS[index % COLORS.length] }} /><span>{name.replaceAll("_", " ").toLowerCase()}</span><b>{value}</b></div>) : <div className="empty-note">Vote data will appear here.</div>}</div></div></div>;
}

export default function Analytics() {
  const [summary, setSummary] = useState(null); const [error, setError] = useState("");
  useEffect(() => { analyticsSummary().then(({ data }) => setSummary(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load analytics"))); }, []);
  if (error) return <div className="error-banner">{error}</div>;
  if (!summary) return <div className="state-block">Crunching the numbers…</div>;
  const participation = summary.totalBoards ? Math.round((summary.boardsWithVotes / summary.totalBoards) * 100) : 0;
  return <div>
    <TopBar eyebrow="Insights" title="Decision analytics" subtitle="Live, server-calculated participation, trends, and outcomes across the boards you can access." />
    <div className="stats"><div className="stat"><div className="num display">{summary.totalBoards}</div><div className="lbl">Boards visible to you</div></div><div className="stat"><div className="num display">{summary.totalVotes}</div><div className="lbl">Total votes cast</div></div><div className="stat"><div className="num display">{participation}%</div><div className="lbl">Boards with votes</div></div><div className="stat"><div className="num display">{summary.closedBoards}</div><div className="lbl">Decisions reached</div></div></div>
    <div className="analytics-grid"><CategoryVisual values={summary.categoryVotes} /><RankedRows label="Poll types used" values={summary.pollTypes} /></div>
    <div className="analytics-grid"><RankedRows label="Option popularity" values={summary.optionPopularity} /><RankedRows label="Community activity" values={summary.communityActivity} /></div>
    <div className="analytics-grid"><RankedRows label="Decision trends" values={summary.decisionTrends} /><RankedRows label="Decision outcomes" values={summary.outcomes} /></div>
    <div className="panel"><h3>Most active decision boards</h3>{summary.mostActive?.length ? <div className="rank-list">{summary.mostActive.map((board, index) => <div className="rank-row" key={board.id}><span className="n">{String(index + 1).padStart(2, "0")}</span><span>{board.title}</span><div className="track"><div className="fill" style={{ width: `${(board.totalVotes / Math.max(1, summary.mostActive[0].totalVotes)) * 100}%` }} /></div><span className="v">{board.totalVotes}</span></div>)}</div> : <div className="empty-note">No boards yet.</div>}</div>
  </div>;
}
