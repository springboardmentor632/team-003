import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import Discussion from "../components/Discussion";
import TopBar from "../components/TopBar";

const ROLE_PROFILES = {
  ADMIN: {
    id: "ADMIN",
    name: "System Admin",
    badge: "Global Admin",
    subtitle: "Organization-wide governance, platform infrastructure, and cross-community moderation.",
    communities: [
      { id: "gov", name: "Platform Governance & Security", role: "OWNER", members: 14, description: "Organization-wide security standards, cloud governance, and vendor compliance." },
      { id: "workplace", name: "Workplace & Culture", role: "ADMIN OVERRIDE", members: 28, description: "Collaborative decisions about how the team works best together." },
      { id: "sustain", name: "Sustainable Choices", role: "ADMIN OVERRIDE", members: 19, description: "Practical ideas for lower-impact operations and everyday choices." },
    ],
    boards: [
      {
        id: "admin-cloud",
        title: "Admin: Cloud migration",
        category: "Technology",
        createdByName: "System Admin",
        createdAt: "2026-09-20T08:30:00.000Z",
        totalVotes: 32,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Choose the best path for the next platform infrastructure move.",
        options: [
          { id: "app-service", title: "Move to Azure App Service", pros: "Lower ops load", cons: "Less control", voteCount: 20, costScore: 7, benefitsScore: 9, riskScore: 8, timeScore: 9, convenienceScore: 8 },
          { id: "container-apps", title: "Use Azure Container Apps", pros: "Better scaling", cons: "More configuration", voteCount: 12, costScore: 6, benefitsScore: 9, riskScore: 7, timeScore: 7, convenienceScore: 7 },
        ],
      },
      {
        id: "admin-onboarding",
        title: "Admin: Team onboarding",
        category: "Education",
        createdByName: "System Admin",
        createdAt: "2026-09-18T10:15:00.000Z",
        totalVotes: 25,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Pick the most effective onboarding program for the next quarter.",
        options: [
          { id: "buddy", title: "Buddy program", pros: "Easy mentoring", cons: "Needs senior staff time", voteCount: 16, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 6, convenienceScore: 8 },
          { id: "hybrid", title: "Hybrid rollout", pros: "Good visibility", cons: "More coordination", voteCount: 9, costScore: 7, benefitsScore: 9, riskScore: 8, timeScore: 7, convenienceScore: 7 },
        ],
      },
      {
        id: "admin-vendor",
        title: "Admin: Vendor shortlist",
        category: "Finance",
        createdByName: "System Admin",
        createdAt: "2026-09-10T14:00:00.000Z",
        totalVotes: 41,
        closed: true,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Choose the best security & compliance vendor partner for the upcoming rollout.",
        options: [
          { id: "vendor-a", title: "Vendor A", pros: "Good pricing & support", cons: "Less customization", voteCount: 27, costScore: 8, benefitsScore: 8, riskScore: 9, timeScore: 8, convenienceScore: 8 },
          { id: "vendor-b", title: "Vendor B", pros: "Great roadmap", cons: "Higher cost", voteCount: 14, costScore: 5, benefitsScore: 9, riskScore: 8, timeScore: 7, convenienceScore: 7 },
        ],
      },
    ],
  },
  MODERATOR: {
    id: "MODERATOR",
    name: "Arjun Mehta",
    badge: "Community Moderator",
    subtitle: "Lead engineering architecture discussions and moderate technical communities.",
    communities: [
      { id: "eng", name: "Engineering Circle", role: "OWNER", members: 22, description: "Share technical trade-offs, architecture ideas, and engineering standards." },
      { id: "ai-guild", name: "AI & Architecture Guild", role: "OWNER", members: 16, description: "Evaluate LLM tooling, inference costs, and distributed service architecture." },
      { id: "prod", name: "Product Builders", role: "MODERATOR", members: 31, description: "A working group for roadmap, feature, and customer-experience decisions." },
    ],
    boards: [
      {
        id: "arjun-gateway",
        title: "Arjun: API gateway & service mesh",
        category: "Technology",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-21T09:00:00.000Z",
        totalVotes: 29,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Select the standard ingress and service-to-service communication layer for microservices.",
        options: [
          { id: "kong", title: "Kong Gateway", pros: "Fast setup for REST & gRPC", cons: "Enterprise plugins cost extra", voteCount: 18, costScore: 7, benefitsScore: 8, riskScore: 8, timeScore: 8, convenienceScore: 8 },
          { id: "istio", title: "Envoy + Istio", pros: "Battle-tested observability", cons: "Steeper learning curve", voteCount: 11, costScore: 6, benefitsScore: 9, riskScore: 8, timeScore: 5, convenienceScore: 6 },
        ],
      },
      {
        id: "arjun-monorepo",
        title: "Arjun: Frontend monorepo tooling",
        category: "Technology",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-19T16:45:00.000Z",
        totalVotes: 34,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Rate the build orchestration tools for our shared UI packages and web apps.",
        options: [
          { id: "turborepo", title: "Turborepo", pros: "Minimal config with npm workspaces", cons: "Fewer code-gen plugins", voteCount: 23, costScore: 9, benefitsScore: 9, riskScore: 8, timeScore: 9, convenienceScore: 9 },
          { id: "nx", title: "Nx Workspace", pros: "Powerful generators & graph", cons: "Heavier configuration", voteCount: 11, costScore: 7, benefitsScore: 9, riskScore: 7, timeScore: 6, convenienceScore: 7 },
        ],
      },
      {
        id: "arjun-oncall",
        title: "Arjun: On-call rotation cadence",
        category: "Lifestyle",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-12T11:20:00.000Z",
        totalVotes: 19,
        closed: true,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Decide on the fairest incident response rotation model for backend engineers.",
        options: [
          { id: "follow-sun", title: "Weekly follow-the-sun", pros: "Clear weekly handoff", cons: "Requires cross-region sync", voteCount: 13, costScore: 8, benefitsScore: 9, riskScore: 9, timeScore: 8, convenienceScore: 8 },
          { id: "split-shift", title: "Split weekday / weekend shifts", pros: "Predictable weekends", cons: "More frequent handoffs", voteCount: 6, costScore: 8, benefitsScore: 7, riskScore: 7, timeScore: 7, convenienceScore: 7 },
        ],
      },
    ],
  },
  OWNER: {
    id: "OWNER",
    name: "Maya Patel",
    badge: "Community Owner",
    subtitle: "Drive product roadmap prioritization and organize team retreats with your communities.",
    communities: [
      { id: "prod-owner", name: "Product Builders", role: "OWNER", members: 31, description: "A working group for roadmap, feature, and customer-experience decisions." },
      { id: "travel-owner", name: "Weekend Explorers", role: "OWNER", members: 24, description: "Plan memorable trips, events, and local experiences together." },
    ],
    boards: [
      {
        id: "maya-roadmap",
        title: "Maya: Q4 product roadmap focus",
        category: "Career",
        createdByName: "Maya Patel",
        createdAt: "2026-09-22T08:30:00.000Z",
        totalVotes: 38,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "We have capacity for one flagship initiative in Q4. Which bet delivers the highest customer impact?",
        options: [
          { id: "copilot", title: "AI decision copilot", pros: "Strong market differentiation", cons: "Inference cost & tuning", voteCount: 24, costScore: 6, benefitsScore: 10, riskScore: 6, timeScore: 6, convenienceScore: 8 },
          { id: "slack-voting", title: "Slack & Teams live voting", pros: "Immediate viral adoption", cons: "Multi-platform maintenance", voteCount: 14, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 8, convenienceScore: 9 },
        ],
      },
      {
        id: "maya-pricing",
        title: "Maya: Design system pricing tier",
        category: "Finance",
        createdByName: "Maya Patel",
        createdAt: "2026-09-17T15:00:00.000Z",
        totalVotes: 21,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Evaluate how we package collaborative analytics and community moderation for growing teams.",
        options: [
          { id: "usage", title: "Usage-based per active board", pros: "Scales naturally with value", cons: "Variable monthly billing", voteCount: 13, costScore: 8, benefitsScore: 9, riskScore: 7, timeScore: 8, convenienceScore: 8 },
          { id: "seat-bundle", title: "Flat community seat bundle", pros: "Predictable ARR", cons: "Higher upfront friction", voteCount: 8, costScore: 7, benefitsScore: 8, riskScore: 8, timeScore: 9, convenienceScore: 7 },
        ],
      },
      {
        id: "maya-retreat",
        title: "Maya: Annual team retreat destination",
        category: "Travel",
        createdByName: "Maya Patel",
        createdAt: "2026-09-09T12:10:00.000Z",
        totalVotes: 44,
        closed: true,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Pick the destination for our 4-day product and design strategy offsite.",
        options: [
          { id: "coorg", title: "Coorg eco-resort", pros: "Great for deep workshops", cons: "3-hour drive from airport", voteCount: 28, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 7, convenienceScore: 7 },
          { id: "goa", title: "Goa beachfront villa", pros: "High team energy & direct flights", cons: "Peak season rates", voteCount: 16, costScore: 6, benefitsScore: 8, riskScore: 8, timeScore: 9, convenienceScore: 9 },
        ],
      },
    ],
  },
  USER: {
    id: "USER",
    name: "Harish",
    badge: "Community Member",
    subtitle: "Compare personal career, travel, and budget options and vote in joined communities.",
    communities: [
      { id: "member-travel", name: "Weekend Explorers", role: "MEMBER", members: 24, description: "Plan memorable trips, events, and local experiences together." },
      { id: "member-workplace", name: "Workplace & Culture", role: "MEMBER", members: 28, description: "Collaborative decisions about how the team works best together." },
    ],
    boards: [
      {
        id: "harish-career",
        title: "Harish: Career switch",
        category: "Career",
        createdByName: "Harish",
        createdAt: "2026-09-23T08:30:00.000Z",
        totalVotes: 27,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Decide which opportunity fits Harish's next move best.",
        options: [
          { id: "product-lead", title: "Product lead role", pros: "Leadership growth & broader impact", cons: "Less hands-on coding", voteCount: 17, costScore: 8, benefitsScore: 9, riskScore: 7, timeScore: 7, convenienceScore: 8 },
          { id: "senior-dev", title: "Senior developer role", pros: "Strong technical growth & salary", cons: "Longer commute", voteCount: 10, costScore: 8, benefitsScore: 8, riskScore: 8, timeScore: 7, convenienceScore: 7 },
        ],
      },
      {
        id: "harish-travel",
        title: "Harish: Travel plan",
        category: "Travel",
        createdByName: "Harish",
        createdAt: "2026-09-20T12:10:00.000Z",
        totalVotes: 19,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Pick the preferred destination for the next break.",
        options: [
          { id: "bali", title: "Bali", pros: "Relaxing & great food", cons: "Long flight", voteCount: 12, costScore: 7, benefitsScore: 9, riskScore: 8, timeScore: 6, convenienceScore: 8 },
          { id: "paris", title: "Paris", pros: "Cultural experience", cons: "Expensive", voteCount: 7, costScore: 4, benefitsScore: 9, riskScore: 8, timeScore: 6, convenienceScore: 7 },
        ],
      },
      {
        id: "harish-budget",
        title: "Harish: Budget priority",
        category: "Finance",
        createdByName: "Harish",
        createdAt: "2026-09-14T10:00:00.000Z",
        totalVotes: 22,
        closed: true,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Select the best way to spend the next quarterly budget.",
        options: [
          { id: "learning", title: "Learning budget", pros: "Strong career ROI", cons: "Longer payback", voteCount: 15, costScore: 8, benefitsScore: 9, riskScore: 9, timeScore: 7, convenienceScore: 8 },
          { id: "home-setup", title: "Upgrade home setup", pros: "Immediate daily focus", cons: "No direct career credential", voteCount: 7, costScore: 6, benefitsScore: 8, riskScore: 9, timeScore: 9, convenienceScore: 9 },
        ],
      },
    ],
  },
};

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

function DemoNav({ active, setView, roleKey, onSelectRole }) {
  return (
    <aside className="sidebar demo-sidebar">
      <div className="brand"><BrandMark /><div className="brand-name">DecisionHub</div></div>
      <div className="demo-label">Interactive preview · {ROLE_PROFILES[roleKey].badge}</div>
      <nav className="nav">
        <div className="nav-label">Switch Role Persona</div>
        {Object.values(ROLE_PROFILES).map((r) => (
          <button key={r.id} className={roleKey === r.id ? "active" : ""} onClick={() => onSelectRole(r.id)}>
            ● <span>{r.badge} ({r.name.split(" ")[0]})</span>
          </button>
        ))}
        <div className="nav-label">Workspace</div>
        <button className={active === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>⌂ <span>Dashboard</span></button>
        <button className={active === "boards" ? "active" : ""} onClick={() => setView("boards")}>◈ <span>Decision boards</span></button>
        <button className={active === "communities" ? "active" : ""} onClick={() => setView("communities")}>◎ <span>Communities</span></button>
        <button className={active === "detail" ? "active" : ""} onClick={() => setView("detail")}>◌ <span>Board details</span></button>
      </nav>
      <div className="demo-side-note">
        Viewing as <b>{ROLE_PROFILES[roleKey].name}</b><br />
        <Link to="/login" style={{ color: "var(--brass)" }}>Sign in to live account →</Link>
      </div>
    </aside>
  );
}

function DashboardDemo({ profile, openBoard, setView }) {
  const boards = profile.boards;
  const active = boards.filter((board) => !board.closed);
  const resolved = boards.filter((board) => board.closed);
  const totalVotes = boards.reduce((sum, board) => sum + board.totalVotes, 0);

  return (
    <div>
      <TopBar
        eyebrow={`Role preview · ${profile.badge}`}
        title={`Good to see you, ${profile.name}.`}
        subtitle={profile.subtitle}
        action={<button className="btn brass" onClick={() => setView("communities")}>View {profile.name.split(" ")[0]}'s communities</button>}
      />
      <div className="demo-banner">
        <span>{profile.badge}</span> Showing distinct decision boards and communities tailored to <b>{profile.name}</b>. Use the sidebar to switch roles.
      </div>
      <div className="stats dashboard-stats">
        <div className="stat"><div className="num display">{active.length}</div><div className="lbl">Open decisions</div></div>
        <div className="stat"><div className="num display">{totalVotes}</div><div className="lbl">Votes recorded</div></div>
        <div className="stat"><div className="num display">{resolved.length}</div><div className="lbl">Decisions reached</div></div>
        <div className="stat"><div className="num display">{profile.communities.length}</div><div className="lbl">Role communities</div></div>
      </div>
      <section className="dashboard-section">
        <div className="section-head dashboard-section-head">
          <div><span className="eyebrow">{profile.badge} workspace</span><h2>{profile.name}'s active decisions</h2></div>
          <button className="section-link demo-link" onClick={() => setView("boards")}>Explore role boards <span>→</span></button>
        </div>
        <div className="card-grid dashboard-card-grid">{active.map((board) => <DemoCard key={board.id} board={board} onOpen={openBoard} />)}</div>
      </section>
      <section className="dashboard-section">
        <div className="section-head dashboard-section-head">
          <div><span className="eyebrow">Role-specific access</span><h2>{profile.name}'s communities</h2></div>
          <button className="section-link demo-link" onClick={() => setView("communities")}>All communities <span>→</span></button>
        </div>
        <div className="card-grid">
          {profile.communities.map((c) => (
            <article className="card" key={c.id}>
              <div className="card-top"><span className="cat">{c.role}</span><span>{c.members} members</span></div>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CommunitiesDemo({ profile, openBoard }) {
  return (
    <div>
      <TopBar
        eyebrow={`Communities · ${profile.badge}`}
        title={`${profile.name}'s Communities`}
        subtitle="Each role owns, moderates, or participates in a distinct set of communities."
      />
      <div className="card-grid">
        {profile.communities.map((community) => (
          <article className="card" key={community.id}>
            <div className="card-top">
              <span className="cat">{community.role}</span>
              <span>{community.members} members</span>
            </div>
            <h3>{community.name}</h3>
            <p>{community.description}</p>
            <div className="card-foot">
              <span>Role: {community.role}</span>
              <button className="btn ghost" onClick={() => openBoard(profile.boards[0])}>View decisions →</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function BoardsDemo({ profile, openBoard, setView }) {
  const boards = profile.boards;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const categories = ["All", ...new Set(boards.map((board) => board.category))];
  const filtered = useMemo(() => boards.filter((board) => {
    const text = `${board.title} ${board.category} ${board.createdByName}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (category === "All" || board.category === category) && (status === "All" || (status === "Open" ? !board.closed : board.closed));
  }), [boards, category, query, status]);

  return (
    <div>
      <div className="breadcrumb boards-breadcrumb"><button onClick={() => setView("dashboard")}>Dashboard</button><span>/</span><b>Decision boards ({profile.name})</b></div>
      <TopBar eyebrow={`Browse · ${profile.badge}`} title={`${profile.name}'s Decision Boards`} subtitle={profile.subtitle} action={<button className="btn brass" onClick={() => openBoard(boards[0])}>Open top board</button>} />
      <section className="boards-controls">
        <div className="board-tabs"><button className="active">{profile.name}'s boards</button></div>
        <div className="board-search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, category, or creator" /><button type="button" onClick={() => setQuery("")}>×</button></div>
      </section>
      <div className="filter-groups">
        <div className="filter-set"><span className="filter-label">Category</span><div className="filter-row">{categories.map((item) => <button key={item} className={`chip ${category === item ? "on" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="filter-set"><span className="filter-label">Status</span><div className="filter-row">{["All", "Open", "Closed"].map((item) => <button key={item} className={`chip ${status === item ? "on" : ""}`} onClick={() => setStatus(item)}>{item}</button>)}</div></div>
      </div>
      <div className="board-results-head"><span>{filtered.length} {filtered.length === 1 ? "board" : "boards"} found</span></div>
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
  const [roleKey, setRoleKey] = useState("ADMIN");
  const [view, setView] = useState("dashboard");
  const profile = ROLE_PROFILES[roleKey];
  const [selected, setSelected] = useState(profile.boards[0]);

  const handleSelectRole = (nextRole) => {
    setRoleKey(nextRole);
    setSelected(ROLE_PROFILES[nextRole].boards[0]);
    if (view === "detail") setView("dashboard");
  };

  const openBoard = (board) => { setSelected(board); setView("detail"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="shell demo-shell">
      <DemoNav active={view} setView={setView} roleKey={roleKey} onSelectRole={handleSelectRole} />
      <main className="demo-main">
        {view === "dashboard" && <DashboardDemo profile={profile} openBoard={openBoard} setView={setView} />}
        {view === "boards" && <BoardsDemo profile={profile} openBoard={openBoard} setView={setView} />}
        {view === "communities" && <CommunitiesDemo profile={profile} openBoard={openBoard} />}
        {view === "detail" && <DetailDemo key={selected.id} board={selected} setView={setView} />}
      </main>
    </div>
  );
}
