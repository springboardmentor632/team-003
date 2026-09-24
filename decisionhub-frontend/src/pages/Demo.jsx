import React, { useMemo, useState } from "react";
import BrandMark from "../components/BrandMark";
import Discussion from "../components/Discussion";
import TopBar from "../components/TopBar";

const BOARDS = [
  {
    id: "strategy",
    title: "Which customer segment should we prioritize next?",
    category: "Strategy",
    createdByName: "Maya Chen",
    createdAt: "2026-09-12T08:30:00.000Z",
    totalVotes: 24,
    visibility: "PUBLIC",
    pollType: "SINGLE_CHOICE",
    description: "We have capacity for one focused go-to-market motion next quarter. Help us choose the segment with the strongest fit.",
    options: [
      { id: "mid-market", title: "Mid-market teams", pros: "Clear need and shorter deal cycles", cons: "Competitive segment", voteCount: 14, costScore: 7, benefitsScore: 9, riskScore: 7, timeScore: 8, convenienceScore: 8 },
      { id: "enterprise", title: "Enterprise accounts", pros: "Higher contract value", cons: "Longer evaluation process", voteCount: 10, costScore: 5, benefitsScore: 8, riskScore: 5, timeScore: 4, convenienceScore: 5 },
    ],
  },
  {
    id: "offsite",
    title: "Where should we hold the team offsite?",
    category: "Culture",
    createdByName: "Jordan Lee",
    createdAt: "2026-09-11T12:10:00.000Z",
    totalVotes: 18,
    visibility: "PUBLIC",
    pollType: "SINGLE_CHOICE",
    description: "Choose a setting that gives the team enough room to plan, reset, and spend time together.",
    options: [
      { id: "goa", title: "Goa", pros: "Easy to reach and relaxed", cons: "Peak-season availability", voteCount: 11, costScore: 7, benefitsScore: 8, riskScore: 8, timeScore: 8, convenienceScore: 9 },
      { id: "coorg", title: "Coorg", pros: "Quiet, focused setting", cons: "Longer transfers", voteCount: 7, costScore: 8, benefitsScore: 7, riskScore: 8, timeScore: 6, convenienceScore: 6 },
    ],
  },
  {
    id: "stack",
    title: "Should we move the design system to Storybook?",
    category: "Technology",
    createdByName: "Aarav Patel",
    createdAt: "2026-09-10T16:45:00.000Z",
    totalVotes: 31,
    visibility: "PUBLIC",
    pollType: "RATING",
    description: "A shared component workspace could improve consistency, but we need to agree on the migration effort.",
    options: [
      { id: "storybook", title: "Adopt Storybook", pros: "Faster reviews and shared documentation", cons: "Migration time", voteCount: 22, costScore: 6, benefitsScore: 9, riskScore: 7, timeScore: 6, convenienceScore: 8 },
      { id: "current", title: "Keep the current approach", pros: "No transition cost", cons: "Harder to discover components", voteCount: 9, costScore: 9, benefitsScore: 5, riskScore: 8, timeScore: 9, convenienceScore: 6 },
    ],
  },
  {
    id: "launch",
    title: "Which launch message resonated best?",
    category: "Marketing",
    createdByName: "Maya Chen",
    createdAt: "2026-09-08T10:00:00.000Z",
    totalVotes: 42,
    closed: true,
    visibility: "PUBLIC",
    pollType: "SINGLE_CHOICE",
    description: "The launch poll has closed. This record keeps the evidence behind the campaign direction.",
    options: [
      { id: "outcome", title: "Lead with outcomes", pros: "Clear customer value", cons: "Less feature detail", voteCount: 29, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 9, convenienceScore: 9 },
      { id: "features", title: "Lead with features", pros: "Specific product proof", cons: "More technical", voteCount: 13, costScore: 8, benefitsScore: 7, riskScore: 7, timeScore: 8, convenienceScore: 7 },
    ],
  },
];

const FACTORS = [
  ["costScore", "Cost"],
  ["benefitsScore", "Benefits"],
  ["riskScore", "Risk"],
  ["timeScore", "Time"],
  ["convenienceScore", "Convenience"],
];

function DemoCard({ board, onOpen }) {
  const [first, second] = [...board.options].sort((a, b) => b.voteCount - a.voteCount);
  const share = Math.round((first.voteCount / board.totalVotes) * 100);

  return (
    <button className="card demo-card" type="button" onClick={() => onOpen(board)}>
      <div className="card-top">
        <span className="cat">{board.category}</span>
        <span className={`status-pill ${board.closed ? "closed" : "open"}`}>{board.closed ? "Decision reached" : "Voting open"}</span>
      </div>
      <h3>{board.title}</h3>
      <div className="tip">
        <div className="tip-row"><span className="opt">{first.title}</span><span className="pct">{share}%</span></div>
        <div className="tip-track"><div className="tip-fill a" style={{ width: `${share}%` }} /></div>
      </div>
      <div className="tip">
        <div className="tip-row"><span className="opt">{second.title}</span><span className="pct">{100 - share}%</span></div>
        <div className="tip-track"><div className="tip-fill b" style={{ width: `${100 - share}%` }} /></div>
      </div>
      <div className="card-foot"><span>{board.pollType.replace("_", " ").toLowerCase()}</span><span>{board.totalVotes} votes <b>→</b></span></div>
    </button>
  );
}

function DemoNav({ active, setView }) {
  return (
    <aside className="sidebar demo-sidebar">
      <div className="brand"><BrandMark /><div className="brand-name">DecisionHub</div></div>
      <div className="demo-label">Interactive preview</div>
      <nav className="nav">
        <div className="nav-label">Workspace</div>
        <button className={active === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>⌂ <span>Dashboard</span></button>
        <button className={active === "boards" ? "active" : ""} onClick={() => setView("boards")}>◈ <span>Decision boards</span></button>
        <button className={active === "detail" ? "active" : ""} onClick={() => setView("detail")}>◌ <span>Board details</span></button>
      </nav>
      <div className="demo-side-note">Sample workspace<br />No account required</div>
    </aside>
  );
}

function DashboardDemo({ openBoard, setView }) {
  const active = BOARDS.filter((board) => !board.closed);
  const totalVotes = BOARDS.reduce((sum, board) => sum + board.totalVotes, 0);

  return (
    <div>
      <TopBar eyebrow="Workspace overview · Sep 12" title="Good to see you, Harish." subtitle="Keep momentum on the decisions that need your attention, then see what your workspace is deciding next." action={<button className="btn brass" onClick={() => setView("boards")}>Explore decision boards</button>} />
      <div className="demo-banner"><span>Demo mode</span> Explore the new dashboard, board directory, and discussion UI with sample workspace data.</div>
      <div className="stats dashboard-stats">
        <div className="stat"><div className="num display">3</div><div className="lbl">Open decisions</div></div>
        <div className="stat"><div className="num display">115</div><div className="lbl">Votes recorded</div></div>
        <div className="stat"><div className="num display">1</div><div className="lbl">Decisions reached</div></div>
        <div className="stat"><div className="num display">{BOARDS.length}</div><div className="lbl">Boards created</div></div>
      </div>
      <section className="dashboard-section">
        <div className="section-head dashboard-section-head"><div><span className="eyebrow">Needs attention</span><h2>Active decisions</h2></div><button className="section-link demo-link" onClick={() => setView("boards")}>Explore all boards <span>→</span></button></div>
        <div className="card-grid dashboard-card-grid">{active.map((board) => <DemoCard key={board.id} board={board} onOpen={openBoard} />)}</div>
      </section>
      <section className="dashboard-section recent-section">
        <div className="section-head dashboard-section-head"><div><span className="eyebrow">Latest in your workspace</span><h2>Recently created</h2></div></div>
        <div className="recent-boards">
          {BOARDS.map((board) => <button className="recent-board-row demo-recent-row" type="button" onClick={() => openBoard(board)} key={board.id}><span className={`recent-status ${board.closed ? "closed" : "open"}`} /><span className="recent-main"><h3>{board.title}</h3><p>{board.category} <span>·</span> {board.createdByName}</p></span><span className="recent-meta"><span>{board.totalVotes} votes</span><time>{board.closed ? "4 days ago" : "Today"}</time></span><span className="recent-arrow">→</span></button>)}
        </div>
      </section>
    </div>
  );
}

function BoardsDemo({ openBoard, setView }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const categories = ["All", ...new Set(BOARDS.map((board) => board.category))];
  const filtered = useMemo(() => BOARDS.filter((board) => {
    const text = `${board.title} ${board.category} ${board.createdByName}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (category === "All" || board.category === category) && (status === "All" || (status === "Open" ? !board.closed : board.closed));
  }), [category, query, status]);

  return (
    <div>
      <div className="breadcrumb boards-breadcrumb"><button onClick={() => setView("dashboard")}>Dashboard</button><span>/</span><b>Decision boards</b></div>
      <TopBar eyebrow="Browse and compare" title="Decision boards" subtitle="Find the choices your workspace is weighing and add your perspective." action={<button className="btn brass" onClick={() => openBoard(BOARDS[0])}>Open sample board</button>} />
      <section className="boards-controls">
        <div className="board-tabs"><button className="active">Explore boards</button><button>My boards</button></div>
        <div className="board-search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, category, or creator" /><button type="button" onClick={() => setQuery("")}>×</button></div>
        <label className="sort-select"><span>Sort</span><select defaultValue="activity"><option value="activity">Most active</option><option value="new">Recently created</option></select></label>
      </section>
      <div className="filter-groups">
        <div className="filter-set"><span className="filter-label">Category</span><div className="filter-row">{categories.map((item) => <button key={item} className={`chip ${category === item ? "on" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="filter-set"><span className="filter-label">Status</span><div className="filter-row">{["All", "Open", "Closed"].map((item) => <button key={item} className={`chip ${status === item ? "on" : ""}`} onClick={() => setStatus(item)}>{item}</button>)}</div></div>
      </div>
      <div className="board-results-head"><span>{filtered.length} {filtered.length === 1 ? "board" : "boards"} found</span>{(query || category !== "All" || status !== "All") && <button className="text-button" onClick={() => { setQuery(""); setCategory("All"); setStatus("All"); }}>Clear filters</button>}</div>
      <div className="card-grid board-card-grid">{filtered.map((board) => <DemoCard key={board.id} board={board} onOpen={openBoard} />)}</div>
    </div>
  );
}

function DotRow({ score }) {
  return <div className="dot-row">{[1, 2, 3, 4, 5].map((item) => <i key={item} className={`dot ${item <= Math.round(score / 2) ? "fill" : ""}`} />)}</div>;
}

function DetailDemo({ board, setView }) {
  const [votes, setVotes] = useState(board.options.map((option) => option.voteCount));
  const total = votes.reduce((sum, vote) => sum + vote, 0);
  const leadingIndex = votes.indexOf(Math.max(...votes));
  const selectOption = (index) => setVotes((current) => current.map((vote, item) => item === index ? vote + 1 : vote));

  return (
    <div>
      <div className="breadcrumb"><button onClick={() => setView("dashboard")}>Dashboard</button><span>/</span><button onClick={() => setView("boards")}>Decision boards</button><span>/</span><b>{board.title}</b></div>
      <div className="detail-head"><div><h1 className="display">{board.title}</h1><p className="detail-description">{board.description}</p><div className="tag-row"><span className="tag">Public board</span><span className="tag">{total} votes</span><span className="tag">{board.pollType.replace("_", " ").toLowerCase()}</span></div></div><div className="detail-actions"><a className="btn ghost" href="#discussion">Discussion</a><button className="btn ghost">Share board</button></div></div>
      <div className="detail-body"><div><div className="compare-grid">{board.options.map((option, index) => <div className={`opt-card ${index === leadingIndex ? "leading" : ""}`} key={option.id}><div className="opt-card-head"><h3>{option.title}</h3>{index === leadingIndex && <span className="lead-badge">Leading</span>}</div><div className="opt-score mono">Weighted score — {((option.costScore + option.benefitsScore + option.riskScore + option.timeScore + option.convenienceScore) / 5).toFixed(1)} / 10</div><div className="pc-row"><span className="pc-label pros">+ Pro</span><span>{option.pros}</span></div><div className="pc-row"><span className="pc-label cons">− Con</span><span>{option.cons}</span></div><button className="vote-btn" onClick={() => selectOption(index)}>Vote for this option</button></div>)}</div>
        <div className="section-head"><h2>Comparison by criteria</h2></div><table className="criteria-table"><thead><tr><th>Criteria</th>{board.options.map((option) => <th key={option.id}>{option.title}</th>)}</tr></thead><tbody>{FACTORS.map(([key, label]) => <tr key={key}><td>{label}</td>{board.options.map((option) => <td key={option.id} className="score"><DotRow score={option[key]} /></td>)}</tr>)}</tbody></table>
        <Discussion boardId={`demo-${board.id}`} />
      </div><aside className="rail"><div className="rail-panel"><h4>Board info</h4><div className="rail-meta"><span className="k">Created by</span><span>{board.createdByName}</span></div><div className="rail-meta"><span className="k">Category</span><span>{board.category}</span></div><div className="rail-meta"><span className="k">Visibility</span><span>Public</span></div><div className="rail-meta"><span className="k">Poll type</span><span>{board.pollType.replace("_", " ").toLowerCase()}</span></div></div><div className="rail-panel"><h4>Vote breakdown</h4>{board.options.map((option, index) => <div className="voter-row" key={option.id}><span className="who">{option.title}</span><span className={`pick ${index === leadingIndex ? "a" : "b"}`}>{Math.round((votes[index] / total) * 100)}% · {votes[index]}</span></div>)}</div></aside></div>
    </div>
  );
}

export default function Demo() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(BOARDS[0]);
  const openBoard = (board) => { setSelected(board); setView("detail"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="shell demo-shell">
      <DemoNav active={view} setView={setView} />
      <main className="demo-main">
        {view === "dashboard" && <DashboardDemo openBoard={openBoard} setView={setView} />}
        {view === "boards" && <BoardsDemo openBoard={openBoard} setView={setView} />}
        {view === "detail" && <DetailDemo board={selected} setView={setView} />}
      </main>
    </div>
  );
}
