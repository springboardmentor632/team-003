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
      { id: "gov", name: "Platform Governance & Security", role: "OWNER", members: 18, description: "Global security standards, multi-region compliance, enterprise SSO, and cloud infrastructure governance." },
      { id: "workplace", name: "Workplace & Culture", role: "ADMIN OVERRIDE", members: 34, description: "Collaborative policies, compensation guidelines, and inclusive workplace initiatives." },
      { id: "sustain", name: "Sustainable Choices", role: "ADMIN OVERRIDE", members: 21, description: "Campus renewable energy programs, carbon footprint reduction, and zero-waste initiatives." },
    ],
    boards: [
      {
        id: "admin-cloud",
        title: "Enterprise Cloud Hosting & Multi-Region Resiliency",
        category: "Technology",
        createdByName: "System Admin",
        createdAt: "2026-09-20T08:30:00.000Z",
        totalVotes: 36,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Select the primary cloud architecture for DecisionHub's multi-region SLA (99.99% uptime), data residency compliance, and disaster recovery.",
        options: [
          { id: "aws-global", title: "Multi-Region AWS with EKS & Aurora Global", pros: "Sub-second automated failover & FedRAMP certified", cons: "Higher cloud infrastructure spend & complex VPC peering", voteCount: 20, costScore: 6, benefitsScore: 10, riskScore: 8, timeScore: 7, convenienceScore: 8 },
          { id: "azure-aks", title: "Azure Kubernetes Service (AKS) with Azure SQL", pros: "Pre-negotiated M365 enterprise pricing & native Entra ID tie-in", cons: "Cross-region active-active failover requires manual intervention", voteCount: 11, costScore: 7, benefitsScore: 9, riskScore: 8, timeScore: 8, convenienceScore: 8 },
          { id: "serverless-edge", title: "Serverless Container Apps with Managed Edge", pros: "Lowest idle cost and zero node maintenance", cons: "Cold-start latencies on bursty deliberation spikes", voteCount: 5, costScore: 9, benefitsScore: 7, riskScore: 7, timeScore: 9, convenienceScore: 8 },
        ],
      },
      {
        id: "admin-sso",
        title: "Enterprise SSO & Zero-Trust Identity Standard",
        category: "Technology",
        createdByName: "System Admin",
        createdAt: "2026-09-18T10:15:00.000Z",
        totalVotes: 31,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Mandate organization-wide authentication standards, SAML 2.0 / SCIM directory sync, and automated offboarding controls.",
        options: [
          { id: "okta", title: "Okta Workforce Identity Cloud", pros: "Gold standard SCIM automation, rich compliance audit logs", cons: "Higher per-user monthly licensing fee", voteCount: 18, costScore: 6, benefitsScore: 10, riskScore: 9, timeScore: 9, convenienceScore: 9 },
          { id: "entra-id", title: "Microsoft Entra ID Federation", pros: "Bundled with existing enterprise license, zero procurement friction", cons: "Custom multi-tenant external guest workflows require Azure AD B2B config", voteCount: 9, costScore: 9, benefitsScore: 9, riskScore: 8, timeScore: 8, convenienceScore: 8 },
          { id: "fido2-keys", title: "FIDO2 Hardware Security Keys (YubiKey)", pros: "Immune to phishing and credential stuffing attacks", cons: "Physical key distribution & replacement logistics for remote staff", voteCount: 4, costScore: 7, benefitsScore: 8, riskScore: 10, timeScore: 6, convenienceScore: 7 },
        ],
      },
      {
        id: "admin-privacy",
        title: "AI Model Data Privacy & Sovereign Training Policy",
        category: "Finance",
        createdByName: "System Admin",
        createdAt: "2026-09-10T14:00:00.000Z",
        totalVotes: 42,
        closed: true,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Adopt contractual data protections ensuring customer deliberation transcripts and community votes are never used for public LLM training.",
        options: [
          { id: "zdr-api", title: "Zero Data Retention (ZDR) Enterprise API Agreement", pros: "Guaranteed data isolation with zero customer data retained or trained on", cons: "Requires minimum annual API spend commitment", voteCount: 26, costScore: 8, benefitsScore: 10, riskScore: 9, timeScore: 9, convenienceScore: 9 },
          { id: "dedicated-gw", title: "Dedicated Single-Tenant Model Gateway", pros: "Predictable latency and custom compliance controls", cons: "High base provisioned throughput cost even during low hours", voteCount: 11, costScore: 5, benefitsScore: 9, riskScore: 8, timeScore: 7, convenienceScore: 7 },
          { id: "self-hosted-llama", title: "Self-Hosted Llama 3 on Private Bare-Metal VPC", pros: "Zero data leaves the corporate perimeter", cons: "Requires specialized on-call ML infrastructure engineering team", voteCount: 5, costScore: 6, benefitsScore: 7, riskScore: 7, timeScore: 5, convenienceScore: 6 },
        ],
      },
    ],
  },
  MODERATOR: {
    id: "MODERATOR",
    name: "Arjun Mehta",
    badge: "Community Moderator",
    subtitle: "Lead engineering architecture discussions, technical RFC deliberations, and community moderation.",
    communities: [
      { id: "eng", name: "Engineering Circle", role: "OWNER", members: 27, description: "Microservices architecture, ingress routing, developer tooling, and technical design RFCs." },
      { id: "ai-guild", name: "AI & Architecture Guild", role: "OWNER", members: 19, description: "LLM inference performance, prompt engineering guardrails, and automated deliberation synthesis." },
      { id: "prod", name: "Product Builders", role: "MODERATOR", members: 35, description: "A working group for roadmap, feature, and customer-experience decisions." },
    ],
    boards: [
      {
        id: "arjun-gateway",
        title: "Microservices Ingress Gateway & Service Mesh Architecture",
        category: "Technology",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-21T09:00:00.000Z",
        totalVotes: 33,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Select the standard ingress routing, mTLS encryption layer, and traffic telemetry gateway for our containerized services.",
        options: [
          { id: "envoy-istio", title: "Envoy Gateway + Ambient Istio Mesh", pros: "Low memory overhead with transparent mTLS & distributed tracing", cons: "Relatively new specification with evolving operator tooling", voteCount: 19, costScore: 7, benefitsScore: 10, riskScore: 8, timeScore: 7, convenienceScore: 8 },
          { id: "kong", title: "Kong Enterprise Gateway", pros: "Vibrant plugin ecosystem, intuitive web UI, and fast team onboarding", cons: "Enterprise rate limiting and security plugins require paid tier", voteCount: 10, costScore: 6, benefitsScore: 8, riskScore: 9, timeScore: 9, convenienceScore: 9 },
          { id: "spring-gw", title: "Spring Cloud Gateway on Native GraalVM", pros: "Zero third-party infrastructure binary and fast cold starts", cons: "Limited ecosystem for non-JVM polyglot microservices", voteCount: 4, costScore: 9, benefitsScore: 7, riskScore: 8, timeScore: 9, convenienceScore: 8 },
        ],
      },
      {
        id: "arjun-inference",
        title: "AI Inference Engine for Automated Deliberation Summaries",
        category: "Technology",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-19T16:45:00.000Z",
        totalVotes: 35,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Evaluate AI inference backends for real-time discussion thread consensus synthesis, trade-off clustering, and sentiment analytics.",
        options: [
          { id: "claude-gemini", title: "Dual Claude 3.5 Sonnet + Gemini Flash Pipeline", pros: "Exceptional synthesis of nuanced debates with sub-second preliminary summaries", cons: "Multi-provider API key management and token budgeting", voteCount: 22, costScore: 8, benefitsScore: 10, riskScore: 8, timeScore: 8, convenienceScore: 9 },
          { id: "vllm-inferentia", title: "Self-Hosted vLLM on AWS Inferentia2", pros: "Flat predictable monthly cost and low-latency internal network calls", cons: "Requires engineering time for quantization testing and GPU cluster autoscaling", voteCount: 9, costScore: 7, benefitsScore: 8, riskScore: 7, timeScore: 6, convenienceScore: 6 },
          { id: "webllm", title: "Local Edge On-Device WebLLM", pros: "Zero backend API cost and 100% client-side privacy", cons: "Constrained by user machine GPU capacity and initial model download size", voteCount: 4, costScore: 9, benefitsScore: 6, riskScore: 6, timeScore: 7, convenienceScore: 5 },
        ],
      },
      {
        id: "arjun-oncall",
        title: "Engineering Incident Response & On-Call Fair Rotation",
        category: "Lifestyle",
        createdByName: "Arjun Mehta",
        createdAt: "2026-09-12T11:20:00.000Z",
        totalVotes: 23,
        closed: true,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Establish a sustainable, burnout-free incident management rotation model and compensatory time-off schedule for backend engineers.",
        options: [
          { id: "follow-sun", title: "Follow-the-Sun Global Handover", pros: "Zero overnight waking pages; handoffs happen during daytime working hours", cons: "Requires disciplined daily async handoff notes and cross-timezone sync", voteCount: 16, costScore: 8, benefitsScore: 10, riskScore: 9, timeScore: 8, convenienceScore: 9 },
          { id: "split-shift", title: "Primary + Secondary Split Shifts", pros: "Predictable weekends and faster recovery time between shifts", cons: "More frequent context switching across the engineering team", voteCount: 7, costScore: 8, benefitsScore: 7, riskScore: 7, timeScore: 7, convenienceScore: 7 },
        ],
      },
    ],
  },
  OWNER: {
    id: "OWNER",
    name: "Maya Patel",
    badge: "Community Owner",
    subtitle: "Drive product roadmap prioritization, pricing tiering, and organize strategic team summits.",
    communities: [
      { id: "prod-owner", name: "Product Builders", role: "OWNER", members: 35, description: "Product roadmap prioritization, customer discovery synthesis, and collaborative decision matrices." },
      { id: "travel-owner", name: "Weekend Explorers", role: "OWNER", members: 29, description: "Quarterly team workcations, offsite strategy retreats, and cultural immersion experiences." },
    ],
    boards: [
      {
        id: "maya-roadmap",
        title: "Q4 Product Strategy: Real-Time Deliberation vs Native Chat Bots",
        category: "Career",
        createdByName: "Maya Patel",
        createdAt: "2026-09-22T08:30:00.000Z",
        totalVotes: 40,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Prioritize our flagship engineering initiative for Q4 to maximize community engagement, viral team adoption, and user retention.",
        options: [
          { id: "canvas", title: "Real-Time Collaborative Deliberation Canvas", pros: "Live interactive trade-off mapping, instant voting, and animated radar charts", cons: "High WebSocket concurrency and real-time conflict resolution complexity", voteCount: 24, costScore: 6, benefitsScore: 10, riskScore: 7, timeScore: 6, convenienceScore: 8 },
          { id: "slack-teams", title: "Native Slack & Microsoft Teams Deliberation Apps", pros: "Brings voting directly into daily channels with zero user onboarding friction", cons: "Subject to third-party app store approval delays and UI constraints", voteCount: 11, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 8, convenienceScore: 9 },
          { id: "ai-linear", title: "AI Consensus Synthesizer & Linear/GitHub Exporter", pros: "Turns concluded deliberation outcomes into actionable engineering backlog items", cons: "Requires structured prompt safety guardrails to prevent hallucinated tasks", voteCount: 5, costScore: 7, benefitsScore: 8, riskScore: 8, timeScore: 8, convenienceScore: 8 },
        ],
      },
      {
        id: "maya-pricing",
        title: "SaaS Pricing Architecture: Community Tiers & Pro Features",
        category: "Finance",
        createdByName: "Maya Patel",
        createdAt: "2026-09-17T15:00:00.000Z",
        totalVotes: 25,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Structure subscription packages for scaling communities transitioning from public grassroots boards to private organizational governance.",
        options: [
          { id: "freemium-pro", title: "Freemium Public Communities + $12/Seat Enterprise Pro", pros: "Drives viral community discovery while capturing predictable corporate software budget", cons: "Free tier infrastructure subsidization requires proactive moderation monitoring", voteCount: 16, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 9, convenienceScore: 8 },
          { id: "usage-metered", title: "Usage-Based Active Participant Metering", pros: "Low barrier to entry for small clubs; costs scale strictly with platform engagement", cons: "Monthly invoice variability can complicate enterprise procurement approval", voteCount: 9, costScore: 7, benefitsScore: 8, riskScore: 7, timeScore: 8, convenienceScore: 7 },
        ],
      },
      {
        id: "maya-retreat",
        title: "Annual Product & Design Strategy Retreat Destination",
        category: "Travel",
        createdByName: "Maya Patel",
        createdAt: "2026-09-09T12:10:00.000Z",
        totalVotes: 46,
        closed: true,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Select the destination for our 4-day annual team summit combining intensive product strategy workshops and collaborative outdoor activities.",
        options: [
          { id: "coorg", title: "Coorg Coffee Hills Eco-Resort", pros: "Tranquil natural environment ideal for uninterrupted strategic focus", cons: "Requires 3.5-hour scenic coach ride from nearest international airport", voteCount: 28, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 7, convenienceScore: 7 },
          { id: "goa", title: "Goa Beachfront Innovation Villa", pros: "Direct flights from major cities, energetic creative vibe, and team beach dinners", cons: "Higher peak season flight and lodging rates", voteCount: 12, costScore: 6, benefitsScore: 8, riskScore: 8, timeScore: 9, convenienceScore: 9 },
          { id: "udaipur", title: "Udaipur Lakeside Heritage Palace", pros: "Culturally immersive setting sparking creative design thinking", cons: "Warmer afternoon temperatures during outdoor activity windows", voteCount: 6, costScore: 7, benefitsScore: 8, riskScore: 7, timeScore: 7, convenienceScore: 8 },
        ],
      },
    ],
  },
  USER: {
    id: "USER",
    name: "Harish",
    badge: "Community Member",
    subtitle: "Compare personal professional growth pathways, team workcations, and vote on community initiatives.",
    communities: [
      { id: "member-travel", name: "Weekend Explorers", role: "MEMBER", members: 29, description: "Quarterly team workcations, offsite strategy retreats, and cultural immersion experiences." },
      { id: "member-workplace", name: "Workplace & Culture", role: "MEMBER", members: 34, description: "Collaborative policies, compensation guidelines, and inclusive workplace initiatives." },
    ],
    boards: [
      {
        id: "harish-career",
        title: "Career Trajectory: Staff Technical Lead vs Engineering Management",
        category: "Career",
        createdByName: "Harish",
        createdAt: "2026-09-23T08:30:00.000Z",
        totalVotes: 32,
        visibility: "PUBLIC",
        pollType: "SINGLE_CHOICE",
        description: "Decide between individual contributor technical architecture mastery and the engineering people leadership track for long-term impact.",
        options: [
          { id: "staff-arch", title: "Staff Principal Architect Track", pros: "Deep hands-on technical leverage, cross-team design authority, and minimal direct reports", cons: "Demands continuous self-directed learning to stay ahead of architectural shifts", voteCount: 19, costScore: 8, benefitsScore: 10, riskScore: 7, timeScore: 8, convenienceScore: 8 },
          { id: "eng-mgr", title: "Engineering Manager Track", pros: "Broad organizational influence, team culture shaping, and executive visibility", cons: "Significant reduction in code commits and increased operational calendar syncs", voteCount: 9, costScore: 8, benefitsScore: 8, riskScore: 8, timeScore: 7, convenienceScore: 7 },
          { id: "startup-founder", title: "Founding Engineer at High-Growth Series A", pros: "Extreme product autonomy, massive potential financial upside, and rapid career acceleration", cons: "Higher startup volatility and longer hours during initial product launch sprints", voteCount: 4, costScore: 5, benefitsScore: 9, riskScore: 5, timeScore: 6, convenienceScore: 6 },
        ],
      },
      {
        id: "harish-travel",
        title: "Quarterly Team Workcation Destination",
        category: "Travel",
        createdByName: "Harish",
        createdAt: "2026-09-20T12:10:00.000Z",
        totalVotes: 24,
        visibility: "PUBLIC",
        pollType: "MULTIPLE_CHOICE",
        description: "Pick our community's collaborative workcation destination for a month of productive co-working and cultural discovery.",
        options: [
          { id: "bali", title: "Bali Canggu Digital Nomad Hub", pros: "Vibrant tech creator community, low cost of living, and healthy lifestyle activities", cons: "Long flight connection times for Western European and US colleagues", voteCount: 13, costScore: 8, benefitsScore: 9, riskScore: 8, timeScore: 6, convenienceScore: 8 },
          { id: "lisbon", title: "Lisbon Tech Oasis", pros: "Optimal timezone bridge between US and Asia, walkable city, and vibrant meetup scene", cons: "Higher peak European summer lodging prices", voteCount: 7, costScore: 6, benefitsScore: 9, riskScore: 8, timeScore: 8, convenienceScore: 9 },
          { id: "kyoto", title: "Kyoto Sustainable Craft & Tech Quarter", pros: "Immaculate public transit, peaceful working shrines, and extraordinary cultural depth", cons: "Stricter noise etiquette standards in shared working spaces", voteCount: 4, costScore: 7, benefitsScore: 8, riskScore: 9, timeScore: 7, convenienceScore: 8 },
        ],
      },
      {
        id: "harish-budget",
        title: "Annual Professional Growth & Home Lab Budget Allocation",
        category: "Finance",
        createdByName: "Harish",
        createdAt: "2026-09-14T10:00:00.000Z",
        totalVotes: 26,
        closed: true,
        visibility: "PUBLIC",
        pollType: "RATING",
        description: "Determine the highest-return investment for the annual $2,500 professional development and home lab stipend.",
        options: [
          { id: "cloud-cert", title: "Cloud Architecture Certifications & Learning Subscriptions", pros: "Verifiable industry credentials and immediate practical system design mastery", cons: "Requires disciplined evening and weekend self-study commitment", voteCount: 17, costScore: 9, benefitsScore: 10, riskScore: 9, timeScore: 7, convenienceScore: 8 },
          { id: "ergonomic-desk", title: "Ergonomic Standing Desk, Herman Miller Embody & Dual 4K Displays", pros: "Immediate physical comfort, reduced strain, and sustained daily concentration", cons: "One-off hardware improvement with no direct resume credential accretion", voteCount: 6, costScore: 7, benefitsScore: 8, riskScore: 9, timeScore: 9, convenienceScore: 9 },
          { id: "executive-coach", title: "Executive Communication Coaching & Public Speaking Masterclass", pros: "High long-term career dividend for executive presence and stakeholder persuasion", cons: "Difficult to objectively quantify ROI in the short term", voteCount: 3, costScore: 6, benefitsScore: 8, riskScore: 8, timeScore: 8, convenienceScore: 7 },
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
  const shareA = Math.round((first.voteCount / board.totalVotes) * 100);
  const shareB = second ? Math.round((second.voteCount / board.totalVotes) * 100) : 0;

  return (
    <button className="card demo-card" type="button" onClick={() => onOpen(board)}>
      <div className="card-top">
        <span className="cat">{board.category}</span>
        <span className={`status-pill ${board.closed ? "closed" : "open"}`}>{board.closed ? "Decision reached" : "Voting open"}</span>
      </div>
      <h3>{board.title}</h3>
      <div className="tip">
        <div className="tip-row"><span className="opt">{first.title}</span><span className="pct">{shareA}%</span></div>
        <div className="tip-track"><div className="tip-fill a" style={{ width: `${shareA}%` }} /></div>
      </div>
      {second && (
        <div className="tip">
          <div className="tip-row"><span className="opt">{second.title}</span><span className="pct">{shareB}%</span></div>
          <div className="tip-track"><div className="tip-fill b" style={{ width: `${shareB}%` }} /></div>
        </div>
      )}
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
