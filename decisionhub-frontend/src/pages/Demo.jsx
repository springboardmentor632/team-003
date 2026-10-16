import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import Discussion from "../components/Discussion";
import TopBar from "../components/TopBar";
import ShareModal from "../components/ShareModal";

export const ROLE_PROFILES = {
  ADMIN: {
    id: "ADMIN",
    name: "System Admin",
    roleTag: "Global Admin",
    badge: "🛡️ Global Admin",
    badgeColor: "#7c3aed",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBot&backgroundColor=b6e3f4",
    subtitle: "Organization-wide governance, cloud infrastructure resilience, platform security compliance, and moderation override.",
    capabilities: [
      "Full administrative override across all decision boards (force finalize, close, reopen, or delete)",
      "Global moderation queue access across all communities with one-click resolution and comment hiding",
      "Direct multi-region cloud deployment and zero-trust SSO enterprise identity policies",
      "Organization compliance audit dataset export in CSV and machine-readable JSON format",
    ],
    navLinks: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "boards", label: "Decision boards", icon: "◈" },
      { id: "communities", label: "Communities", icon: "◎" },
      { id: "moderation", label: "Global Moderation Queue", icon: "🛡️" },
      { id: "exports", label: "Compliance & Audit Exports", icon: "📊" },
      { id: "detail", label: "Board details", icon: "◌" },
    ],
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
    roleTag: "Community Moderator",
    badge: "⚙️ Community Moderator",
    badgeColor: "#0284c7",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMod&backgroundColor=d1d4f9",
    subtitle: "Lead engineering RFC deliberations, technical consensus discovery, and maintain civil discussion quality.",
    capabilities: [
      "Moderate engineering circle discussions, hide policy-violating comments, and resolve flags",
      "Define user-evaluated custom criteria for option comparison matrices",
      "Pin consensus synthesis notes to clearly communicate engineering direction",
      "Facilitate microservices, AI inference engines, and on-call rotation deliberations",
    ],
    navLinks: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "boards", label: "Decision boards", icon: "◈" },
      { id: "communities", label: "Communities", icon: "◎" },
      { id: "content-review", label: "Content Review & Flags", icon: "⚖️" },
      { id: "detail", label: "Board details", icon: "◌" },
    ],
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
    roleTag: "Community Owner",
    badge: "👑 Community Owner",
    badgeColor: "#d97706",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MayaLeader&backgroundColor=ffd5dc",
    subtitle: "Direct product roadmap strategy, manage community member rosters, promote moderators, and finalize consensus.",
    capabilities: [
      "Full community lifecycle ownership: manage member rosters, invitations, and permissions",
      "Promote trusted members to Moderator roles and configure community visibility",
      "Finalize consensus, declare winning proposals, and conclude active voting",
      "Export deliberation analytics and raw polling datasets in CSV and JSON formats",
    ],
    navLinks: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "boards", label: "Decision boards", icon: "◈" },
      { id: "communities", label: "Communities", icon: "◎" },
      { id: "roster", label: "Community Roster & Roles", icon: "👑" },
      { id: "exports", label: "Polling Data Exports", icon: "📊" },
      { id: "detail", label: "Board details", icon: "◌" },
    ],
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
    roleTag: "Community Member",
    badge: "👤 Community Member",
    badgeColor: "#00897b",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HarishDev&backgroundColor=c0aede",
    subtitle: "Deliberate on individual growth pathways, collaborate on team workcations, and submit verified ballots.",
    capabilities: [
      "Cast weighted, multiple-choice, and rating ballots with optional anonymity",
      "Retract or revise cast votes prior to community decision closure",
      "Access cryptographically timestamped personal voting history and verified receipts",
      "Submit direct product suggestions, user feedback, and bug reports to maintainers",
    ],
    navLinks: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "boards", label: "Decision boards", icon: "◈" },
      { id: "communities", label: "Communities", icon: "◎" },
      { id: "history", label: "Voting History & Receipts", icon: "⏱️" },
      { id: "feedback", label: "Submit Feedback", icon: "✍️" },
      { id: "detail", label: "Board details", icon: "◌" },
    ],
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
        <span className={`status-pill ${board.closed ? "closed" : "open"}`}>
          {board.closed ? "Decision reached" : "Voting open"}
        </span>
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
      <div className="card-foot">
        <span>{board.pollType.replace("_", " ").toLowerCase()}</span>
        <span>{board.totalVotes} votes <b>→</b></span>
      </div>
    </button>
  );
}

function DemoNav({ active, setView, roleKey, onSelectRole }) {
  const profile = ROLE_PROFILES[roleKey];

  return (
    <aside className="sidebar demo-sidebar">
      <div className="brand"><BrandMark /><div className="brand-name">DecisionHub</div></div>
      <div className="demo-label">Interactive preview · {profile.badge}</div>
      <nav className="nav">
        <div className="nav-label">Switch Role Persona</div>
        {Object.values(ROLE_PROFILES).map((r) => (
          <button
            key={r.id}
            className={roleKey === r.id ? "active" : ""}
            onClick={() => onSelectRole(r.id)}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {r.avatarUrl ? (
              <img
                src={r.avatarUrl}
                alt={r.name}
                style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span>●</span>
            )}
            <span>{r.badge} ({r.name.split(" ")[0]})</span>
          </button>
        ))}

        <div className="nav-label">{profile.name.split(" ")[0]}'s Workspace</div>
        {profile.navLinks.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
          >
            <span>{item.icon}</span> <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="demo-side-note" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div>
          Viewing as <b>{profile.name}</b><br />
          <span style={{ fontSize: 10.5, color: profile.badgeColor, fontWeight: 600 }}>{profile.badge}</span><br />
          <Link to="/login" style={{ color: "var(--brass)", marginTop: 4, display: "inline-block", fontSize: 11.5 }}>
            Sign in to live account →
          </Link>
          <br />
          <Link to="/dashboard" style={{ color: "var(--teal)", marginTop: 6, display: "inline-block", fontSize: 11.5, fontWeight: 600 }}>
            ← Return to Workspace
          </Link>
        </div>
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
        action={<button className="btn brass" onClick={() => setView("boards")}>Explore {profile.name.split(" ")[0]}'s boards</button>}
      />

      <div className="demo-banner" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.3)" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div>
          <span>{profile.badge}</span> Showing tailored workspace, role permissions, and decision boards for <b>{profile.name}</b>.
        </div>
      </div>

      <div className="demo-capabilities-card">
        <h4><span>✨</span> Role Capabilities & Powers ({profile.roleTag})</h4>
        <ul className="demo-capabilities-list">
          {profile.capabilities.map((cap, i) => (
            <li key={i}>{cap}</li>
          ))}
        </ul>
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

function ModerationDemo({ profile, mode = "admin" }) {
  const [reports, setReports] = useState([
    {
      id: 101,
      boardTitle: "Microservices Ingress Gateway & Service Mesh Architecture",
      comment: "This proposal is utterly unworkable and a total waste of engineering time.",
      flaggedBy: "Vikram R. (Staff SRE)",
      reason: "Hostile tone violating RFC discussion guidelines",
      hidden: false,
      status: "PENDING",
      time: "12m ago",
    },
    {
      id: 102,
      boardTitle: "Enterprise Cloud Hosting & Multi-Region Resiliency",
      comment: "Claim your 90% cloud rebate here: https://bit.ly/cloud-rebate-phish",
      flaggedBy: "Maya Patel",
      reason: "Spam link / phishing URL",
      hidden: false,
      status: "PENDING",
      time: "45m ago",
    },
    {
      id: 103,
      boardTitle: "AI Model Data Privacy & Sovereign Training Policy",
      comment: "Completely off-topic rambling regarding unrelated consumer hardware.",
      flaggedBy: "Arjun Mehta",
      reason: "Derailing deliberation thread",
      hidden: false,
      status: "PENDING",
      time: "2h ago",
    },
  ]);

  const [toast, setToast] = useState("");

  const handleResolve = (id, actionType) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setToast(`Report #${id} marked as ${actionType}.`);
  };

  const handleToggleHide = (id) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r))
    );
  };

  return (
    <div>
      <TopBar
        eyebrow={`Governance · ${profile.badge}`}
        title={mode === "admin" ? "Global Moderation Queue" : "Content Review & Discussion Safety"}
        subtitle="Review community flags, manage discussion civility, and enforce deliberation code of conduct."
      />

      {toast && <div className="success-note" style={{ marginBottom: 16 }}>✓ {toast}</div>}

      <div className="stats dashboard-stats" style={{ marginBottom: 24 }}>
        <div className="stat"><div className="num display">{reports.length}</div><div className="lbl">Pending flags</div></div>
        <div className="stat"><div className="num display">18</div><div className="lbl">Resolved this week</div></div>
        <div className="stat"><div className="num display">&lt; 1.5h</div><div className="lbl">Median response time</div></div>
        <div className="stat"><div className="num display">100%</div><div className="lbl">Queue coverage</div></div>
      </div>

      {reports.length === 0 ? (
        <div className="state-block">
          <h3>Moderation queue clear</h3>
          <p>All reported items have been reviewed and resolved. Deliberation standards are maintained.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="recent-boards">
            {reports.map((r) => (
              <div className="recent-board-row" key={r.id}>
                <span className={`recent-status ${r.hidden ? "closed" : "open"}`} />
                <div className="recent-main">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span className="tag" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 600 }}>
                      Flag: {r.reason}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.time} by {r.flaggedBy}</span>
                  </div>
                  <h3 style={{ fontSize: 14, margin: "2px 0 4px" }}>{r.boardTitle}</h3>
                  <div style={{ fontSize: 13, color: r.hidden ? "var(--ink-soft)" : "var(--ink)", fontStyle: r.hidden ? "italic" : "normal" }}>
                    <b>Reported content:</b> "{r.comment}"
                    {r.hidden && <span style={{ marginLeft: 8, color: "#ef4444", fontWeight: 600 }}>(Hidden from public view)</span>}
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="btn ghost" type="button" onClick={() => handleToggleHide(r.id)}>
                    {r.hidden ? "Unhide" : "Hide comment"}
                  </button>
                  <button className="btn ghost" type="button" onClick={() => handleResolve(r.id, "DISMISSED")}>
                    Dismiss
                  </button>
                  <button className="btn brass" type="button" onClick={() => handleResolve(r.id, "RESOLVED")}>
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityRosterDemo({ profile }) {
  const [members, setMembers] = useState([
    { id: 1, name: "Maya Patel", email: "maya@decisionhub.org", role: "OWNER", joined: "Jan 12, 2026", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MayaLeader&backgroundColor=ffd5dc" },
    { id: 2, name: "Arjun Mehta", email: "arjun@decisionhub.org", role: "MODERATOR", joined: "Feb 04, 2026", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMod&backgroundColor=d1d4f9" },
    { id: 3, name: "Harish", email: "harish@decisionhub.org", role: "MEMBER", joined: "Mar 10, 2026", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HarishDev&backgroundColor=c0aede" },
    { id: 4, name: "Priya Sharma", email: "priya@decisionhub.org", role: "MEMBER", joined: "Apr 02, 2026", avatarUrl: "https://api.dicebear.com/7.x/micah/svg?seed=PriyaDesigner&backgroundColor=ffdfbf" },
    { id: 5, name: "Marcus Vance", email: "marcus@decisionhub.org", role: "MEMBER", joined: "May 18, 2026", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusVance&backgroundColor=b6e3f4" },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [toast, setToast] = useState("");

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const member = members.find((m) => m.id === memberId);
    setToast(`Updated role for ${member?.name} to ${newRole}.`);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const rawName = inviteEmail.split("@")[0];
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const newMember = {
      id: Date.now(),
      name: formattedName,
      email: inviteEmail,
      role: inviteRole,
      joined: "Just now",
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
    };
    setMembers((prev) => [...prev, newMember]);
    setToast(`Sent invitation to ${inviteEmail} as ${inviteRole}.`);
    setInviteEmail("");
  };

  return (
    <div>
      <TopBar
        eyebrow={`Community Leadership · ${profile.badge}`}
        title="Community Roster & Permissions"
        subtitle="Manage member permissions, assign community moderators, and invite team members."
      />

      {toast && <div className="success-note" style={{ marginBottom: 16 }}>✓ {toast}</div>}

      <div className="panel" style={{ marginBottom: 24, padding: 18 }}>
        <h3 style={{ fontSize: 14, margin: "0 0 12px 0" }}>Invite New Colleague to Product Builders</h3>
        <form onSubmit={handleInvite} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@organization.org"
            style={{ flex: "1 1 240px" }}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ width: 140 }}>
            <option value="MEMBER">Member</option>
            <option value="MODERATOR">Moderator</option>
          </select>
          <button type="submit" className="btn brass">Send Invitation</button>
        </form>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="demo-roster-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Assigned Role</th>
              <th>Permissions Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                      src={m.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                      alt={m.name}
                      style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <b>{m.name}</b>
                  </div>
                </td>
                <td style={{ color: "var(--ink-soft)" }}>{m.email}</td>
                <td style={{ color: "var(--ink-soft)" }}>{m.joined}</td>
                <td>
                  <span className={`tag ${m.role === "OWNER" ? "brass" : ""}`}>
                    {m.role === "OWNER" ? "👑 Owner" : m.role === "MODERATOR" ? "⚙️ Moderator" : "👤 Member"}
                  </span>
                </td>
                <td>
                  {m.role === "OWNER" ? (
                    <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>Community Creator</span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      style={{ fontSize: 12, padding: "4px 8px" }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MODERATOR">Promote to Moderator</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PollingExportsDemo({ profile }) {
  const [downloading, setDownloading] = useState("");
  const boards = profile.boards;

  const downloadCsv = () => {
    setDownloading("csv");
    const headers = ["ID", "Title", "Category", "PollType", "Status", "TotalVotes", "LeadingOption"];
    const rows = boards.map((b) => {
      const topOpt = [...b.options].sort((x, y) => y.voteCount - x.voteCount)[0]?.title || "";
      return [
        b.id,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${b.category}"`,
        b.pollType,
        b.closed ? "CLOSED" : "OPEN",
        b.totalVotes,
        `"${topOpt.replace(/"/g, '""')}"`,
      ];
    });
    const content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decisionhub-${profile.id.toLowerCase()}-decisions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(""), 600);
  };

  const downloadJson = () => {
    setDownloading("json");
    const content = JSON.stringify(boards, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decisionhub-${profile.id.toLowerCase()}-decisions.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(""), 600);
  };

  return (
    <div>
      <TopBar
        eyebrow={`Exports & Analytics · ${profile.badge}`}
        title="Deliberation Datasets & Polling Exports"
        subtitle="Export structured decision matrices, criteria scores, and voter distribution records."
      />

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <article className="card">
          <div className="card-top"><span className="cat">Tabular Analysis</span><span className="lead-badge">Ready</span></div>
          <h3>Spreadsheet Matrix (CSV)</h3>
          <p>Download tabular decision summaries, including vote shares, criteria evaluations, and category distributions for {profile.name}'s boards.</p>
          <div className="card-foot" style={{ marginTop: 20 }}>
            <button className="btn brass" type="button" onClick={downloadCsv} disabled={Boolean(downloading)}>
              {downloading === "csv" ? "Generating CSV…" : "Download CSV Dataset"}
            </button>
          </div>
        </article>

        <article className="card">
          <div className="card-top"><span className="cat">Raw Data Format</span><span className="lead-badge">Ready</span></div>
          <h3>Full Decision Schema (JSON)</h3>
          <p>Export complete decision objects, evaluation factor weights, option comparison criteria, and timestamps formatted for programmatic ingestion.</p>
          <div className="card-foot" style={{ marginTop: 20 }}>
            <button className="btn ghost" type="button" onClick={downloadJson} disabled={Boolean(downloading)}>
              {downloading === "json" ? "Generating JSON…" : "Download JSON Schema"}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function VotingHistoryDemo({ profile }) {
  const [receipts] = useState([
    {
      id: "REC-9014",
      hash: "0x7a8fe2...c914b5",
      decisionTitle: "Career Trajectory: Staff Technical Lead vs Engineering Management",
      choice: "Staff Principal Architect Track",
      type: "Single Choice",
      timestamp: "Today at 09:14 AM",
      status: "VERIFIED_ON_LEDGER",
    },
    {
      id: "REC-8841",
      hash: "0x3c2ba7...84e6f1",
      decisionTitle: "Quarterly Team Workcation Destination",
      choice: "Bali Canggu Digital Nomad Hub",
      type: "Multiple Choice",
      timestamp: "Yesterday at 04:30 PM",
      status: "VERIFIED_ON_LEDGER",
    },
    {
      id: "REC-7120",
      hash: "0x91e4a3...f507d8",
      decisionTitle: "Annual Professional Growth & Home Lab Budget Allocation",
      choice: "Cloud Architecture Certifications (Rating: 5 ★)",
      type: "Rating (1–5)",
      timestamp: "Sep 15, 2026",
      status: "CONSENSUS_CONCLUDED",
    },
  ]);

  const [copied, setCopied] = useState("");

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div>
      <TopBar
        eyebrow={`Audit Trail · ${profile.badge}`}
        title={`${profile.name}'s Verified Voting History`}
        subtitle="Review your tamper-evident ballot receipts and cryptographically timestamped decision participation."
      />

      <div className="stats dashboard-stats" style={{ marginBottom: 24 }}>
        <div className="stat"><div className="num display">{receipts.length}</div><div className="lbl">Verified ballots</div></div>
        <div className="stat"><div className="num display">100%</div><div className="lbl">Ledger verification</div></div>
        <div className="stat"><div className="num display">3</div><div className="lbl">Distinct categories</div></div>
        <div className="stat"><div className="num display">SHA-256</div><div className="lbl">Receipt security</div></div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="demo-roster-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Decision Board</th>
              <th>Your Ballot Choice</th>
              <th>Timestamp</th>
              <th>Cryptographic Receipt Hash</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id}>
                <td><b>{r.id}</b></td>
                <td>{r.decisionTitle}</td>
                <td><span className="tag brass">{r.choice}</span></td>
                <td style={{ color: "var(--ink-soft)" }}>{r.timestamp}</td>
                <td>
                  <button
                    type="button"
                    className="demo-crypto-hash"
                    onClick={() => handleCopy(r.hash)}
                    title="Click to copy receipt hash"
                  >
                    {copied === r.hash ? "✓ Copied!" : r.hash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackDemo({ profile }) {
  const [category, setCategory] = useState("Feature Request");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return;
    setSubmitted(true);
    setMessage("");
  };

  return (
    <div>
      <TopBar
        eyebrow={`Community Input · ${profile.badge}`}
        title="Submit Platform Feedback"
        subtitle="Share user experience suggestions, feature requests, or praise with the maintainers."
      />

      {submitted && (
        <div className="success-note" style={{ marginBottom: 18, padding: 14, background: "rgba(0,137,123,0.08)", borderRadius: "var(--radius)" }}>
          ✓ Thank you, {profile.name}! Your feedback has been delivered to the platform engineering team.
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="field">
          <label>Feedback Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Feature Request">Feature Request</option>
            <option value="UI / UX Improvement">UI / UX Usability Improvement</option>
            <option value="Performance">Deliberation Speed & Performance</option>
            <option value="General Praise">General Praise</option>
          </select>
        </div>

        <div className="field">
          <label>Overall Experience Satisfaction (1–5 Stars)</label>
          <div style={{ display: "flex", gap: 8, fontSize: 22, cursor: "pointer", color: "var(--brass)" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", padding: "2px 4px", color: star <= rating ? "#f59e0b" : "#d1d5db" }}
              >
                ★
              </button>
            ))}
            <span style={{ fontSize: 13, alignSelf: "center", color: "var(--ink-soft)", marginLeft: 6 }}>
              ({rating} of 5 stars)
            </span>
          </div>
        </div>

        <div className="field">
          <label>Your Message & Observations</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setSubmitted(false); }}
            placeholder="Share your thoughts on how we can improve the deliberation workflow…"
          />
        </div>

        <button className="btn brass" type="submit">Submit Feedback to Team</button>
      </form>
    </div>
  );
}

function DotRow({ score, onScoreChange }) {
  const currentLevel = Math.max(1, Math.min(5, Math.round(score / 2)));
  return (
    <div className="dot-row" title={onScoreChange ? "Click a dot to tune this criterion score (1-5)" : undefined}>
      {[1, 2, 3, 4, 5].map((item) => (
        <i
          key={item}
          className={`dot ${item <= currentLevel ? "fill" : ""}`}
          onClick={() => onScoreChange && onScoreChange(item * 2)}
          style={{ cursor: onScoreChange ? "pointer" : "default" }}
        />
      ))}
    </div>
  );
}

function DetailDemo({ board, setView, profile, onSelectRole }) {
  const [votes, setVotes] = useState(board.options.map((option) => option.voteCount));
  const [closed, setClosed] = useState(Boolean(board.closed));
  const [pinnedConsensus, setPinnedConsensus] = useState(false);
  const [hasVotedIndex, setHasVotedIndex] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [liveToast, setLiveToast] = useState("");
  const [criteriaScores, setCriteriaScores] = useState(() =>
    board.options.map((opt) => ({
      costScore: opt.costScore,
      benefitsScore: opt.benefitsScore,
      riskScore: opt.riskScore,
      timeScore: opt.timeScore,
      convenienceScore: opt.convenienceScore,
    }))
  );

  const total = votes.reduce((sum, vote) => sum + vote, 0);
  const leadingIndex = votes.indexOf(Math.max(...votes));

  const selectOption = (index) => {
    if (closed) return;
    if (hasVotedIndex === index) {
      setVotes((current) => current.map((v, i) => (i === index ? v - 1 : v)));
      setHasVotedIndex(null);
      setLiveToast(`Ballot retracted for ${board.options[index].title.split(" ")[0]}.`);
    } else {
      setVotes((current) =>
        current.map((v, i) => {
          if (i === index) return v + 1;
          if (i === hasVotedIndex) return v - 1;
          return v;
        })
      );
      setHasVotedIndex(index);
      setLiveToast(`✓ Vote recorded for ${board.options[index].title.split(" ")[0]} as ${profile.name.split(" ")[0]}!`);
    }
    setTimeout(() => setLiveToast(""), 3500);
  };

  const handleScoreChange = (optIndex, factorKey, newScore) => {
    setCriteriaScores((prev) => {
      const next = [...prev];
      next[optIndex] = { ...next[optIndex], [factorKey]: newScore };
      return next;
    });
    setLiveToast(`Adjusted ${factorKey.replace("Score", "")} factor to ${newScore}/10 for ${board.options[optIndex].title.split(" ")[0]}.`);
    setTimeout(() => setLiveToast(""), 3000);
  };

  const getWeightedScore = (optIndex) => {
    const scores = criteriaScores[optIndex] || board.options[optIndex];
    return (
      (scores.costScore +
        scores.benefitsScore +
        scores.riskScore +
        scores.timeScore +
        scores.convenienceScore) /
      5
    ).toFixed(1);
  };

  const toggleClosure = () => {
    setClosed((prev) => !prev);
  };

  const simulateVotes = () => {
    if (closed) return;
    setVotes((current) => {
      const next = [...current];
      for (let i = 0; i < 5; i++) {
        const rand = Math.floor(Math.random() * next.length);
        next[rand] += 1;
      }
      return next;
    });
    setLiveToast("⚡ 5 simulated community ballots cast! Live consensus recalculated.");
    setTimeout(() => setLiveToast(""), 3500);
  };

  const resetBoard = () => {
    setVotes(board.options.map((option) => option.voteCount));
    setClosed(Boolean(board.closed));
    setPinnedConsensus(false);
    setHasVotedIndex(null);
    setCriteriaScores(
      board.options.map((opt) => ({
        costScore: opt.costScore,
        benefitsScore: opt.benefitsScore,
        riskScore: opt.riskScore,
        timeScore: opt.timeScore,
        convenienceScore: opt.convenienceScore,
      }))
    );
    setLiveToast("↺ Board state reset to initial baseline.");
    setTimeout(() => setLiveToast(""), 3000);
  };

  const exportCsv = () => {
    const rows = [
      ["Option", "Votes", "Percentage Share", "Weighted Score", "Pros", "Cons"],
      ...board.options.map((opt, i) => [
        `"${opt.title}"`,
        votes[i],
        `${total > 0 ? Math.round((votes[i] / total) * 100) : 0}%`,
        getWeightedScore(i),
        `"${opt.pros}"`,
        `"${opt.cons}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, "_")}_ballots.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="breadcrumb">
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <span>/</span>
        <button onClick={() => setView("boards")}>Decision boards</button>
        <span>/</span>
        <b>{board.title}</b>
      </div>

      {/* Interactive Persona Quick Switcher on Board Detail */}
      <div
        className="demo-role-quick-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "12px 18px",
          background: "var(--paper-raised)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>🎭 Active Demo Persona:</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: profile.badgeColor }}>
            {profile.badge} ({profile.name})
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.values(ROLE_PROFILES).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRole && onSelectRole(r.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                fontSize: 11.5,
                borderRadius: 14,
                border: profile.id === r.id ? `2px solid ${r.badgeColor}` : "1px solid var(--line)",
                background: profile.id === r.id ? "rgba(0,137,123,0.12)" : "var(--paper)",
                color: "var(--ink)",
                fontWeight: profile.id === r.id ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={`Switch demonstration persona to ${r.name}`}
            >
              <span>{r.badge.split(" ")[0]}</span>
              <span>{r.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demonstration Actions Toolbar: Simulate votes, reset, export */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          padding: "10px 16px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>⚡ Demonstration Tools:</span>
          <button
            type="button"
            className="btn brass"
            style={{ fontSize: 11.5, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            disabled={closed}
            onClick={simulateVotes}
          >
            <span>⚡ Simulate 5 Community Votes</span>
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 11.5, padding: "5px 12px" }}
            onClick={resetBoard}
          >
            ↺ Reset Ballots
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 11.5, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}
            onClick={exportCsv}
          >
            <span>📊 Export Ballot CSV</span>
          </button>
        </div>

        {liveToast && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--teal)",
              background: "var(--teal-dim)",
              padding: "4px 10px",
              borderRadius: 12,
            }}
          >
            {liveToast}
          </span>
        )}
      </div>

      <div className="detail-head">
        <div>
          <h1 className="display">{board.title}</h1>
          <p className="detail-description">{board.description}</p>
          <div className="tag-row">
            <span className="tag" style={{ background: "rgba(0,137,123,0.1)", color: profile.badgeColor, fontWeight: 600 }}>
              {profile.badge}
            </span>
            <span className="tag">Public board</span>
            <span className="tag">{total} votes</span>
            <span className="tag">{board.pollType.replace("_", " ").toLowerCase()}</span>
            <span className={`tag ${closed ? "closed" : "brass"}`}>
              {closed ? "Consensus Reached (Closed)" : "Voting Open"}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          {(profile.id === "ADMIN" || profile.id === "OWNER") && (
            <button className={`btn ${closed ? "ghost" : "brass"}`} type="button" onClick={toggleClosure}>
              {closed ? "↺ Reopen Voting" : "✓ Finalize Consensus & Close"}
            </button>
          )}
          <a className="btn ghost" href="#discussion">Discussion</a>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setShareOpen(true)}
            title="Share this decision board"
          >
            🔗 Share board
          </button>
        </div>
      </div>

      {/* Role-Specific Capabilities Toolbar */}
      <div className="demo-role-toolbar">
        <div>
          <strong style={{ fontSize: 13, color: "var(--ink)", display: "block" }}>
            {profile.badge} Mode Action Toolbar
          </strong>
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {profile.id === "ADMIN" && "You hold global administrative override permissions on any organization decision board."}
            {profile.id === "MODERATOR" && "You are facilitating this engineering circle's technical RFC deliberation and criteria."}
            {profile.id === "OWNER" && "You are the creator and owner of this decision board with consensus finalization authority."}
            {profile.id === "USER" && "You are an active voting member in this deliberation. Cast or revise your verified ballot below."}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {profile.id === "ADMIN" && (
            <button className="btn ghost" type="button" onClick={toggleClosure} style={{ fontSize: 12, padding: "6px 12px" }}>
              {closed ? "Reopen Board" : "Force Close Board"}
            </button>
          )}
          {profile.id === "MODERATOR" && (
            <button className="btn ghost" type="button" onClick={() => setPinnedConsensus(!pinnedConsensus)} style={{ fontSize: 12, padding: "6px 12px" }}>
              {pinnedConsensus ? "Unpin Consensus" : "📌 Pin Consensus Summary"}
            </button>
          )}
          {profile.id === "OWNER" && (
            <button className="btn brass" type="button" onClick={toggleClosure} style={{ fontSize: 12, padding: "6px 12px" }}>
              {closed ? "Reopen Deliberation" : "Declare Consensus"}
            </button>
          )}
          {profile.id === "USER" && (
            <button className="btn ghost" type="button" onClick={() => setView("history")} style={{ fontSize: 12, padding: "6px 12px" }}>
              ⏱️ View My Ballot Receipts
            </button>
          )}
        </div>
      </div>

      {/* Pinned Consensus Note for Moderator */}
      {pinnedConsensus && (
        <div style={{ marginBottom: 20, padding: 14, background: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.25)", borderRadius: "var(--radius)" }}>
          <strong style={{ color: "#0284c7", fontSize: 13, display: "block" }}>📌 Pinned Moderator Consensus Recommendation</strong>
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            Arjun Mehta (Moderator): "Engineering consensus favors {board.options[leadingIndex].title} due to clear resiliency benefits and production reliability."
          </span>
        </div>
      )}

      {/* Consensus Reached Banner */}
      {closed && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            background: "rgba(217, 119, 6, 0.08)",
            border: "1px solid rgba(217, 119, 6, 0.3)",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>🏆</span>
          <div>
            <strong style={{ color: "#b45309", display: "block", fontSize: 14 }}>
              Consensus Declared & Voting Concluded
            </strong>
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              Deliberation is closed. Leading option <b>{board.options[leadingIndex].title}</b> is declared the community consensus.
            </span>
          </div>
        </div>
      )}

      <div className="detail-body">
        <div>
          <div className="compare-grid">
            {board.options.map((option, index) => {
              const isLeading = index === leadingIndex;
              const hasVoted = hasVotedIndex === index;
              const voteCount = votes[index];
              const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0;
              const weightedScore = getWeightedScore(index);

              return (
                <div className={`opt-card ${isLeading ? "leading" : ""}`} key={option.id}>
                  <div className="opt-card-head">
                    <h3>{option.title}</h3>
                    {isLeading && <span className="lead-badge">{closed ? "🏆 Winner" : "Leading"}</span>}
                  </div>

                  {/* Real-Time Vote Share & Progress Bar */}
                  <div style={{ marginTop: 8, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      <span style={{ color: "var(--ink)" }}>{voteCount} votes</span>
                      <span style={{ color: isLeading ? "var(--brass)" : "var(--teal)" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: isLeading ? "var(--brass)" : "var(--teal)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  <div className="opt-score mono">
                    Weighted score — {weightedScore} / 10
                  </div>
                  <div className="pc-row"><span className="pc-label pros">+ Pro</span><span>{option.pros}</span></div>
                  <div className="pc-row"><span className="pc-label cons">− Con</span><span>{option.cons}</span></div>
                  <button
                    className={`vote-btn ${hasVoted ? "voted" : ""}`}
                    disabled={closed}
                    onClick={() => selectOption(index)}
                  >
                    {closed
                      ? "Voting closed — consensus reached"
                      : hasVoted
                      ? `✓ You voted for this as ${profile.name.split(" ")[0]} (Click to retract)`
                      : `Vote for this option as ${profile.name.split(" ")[0]}`}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="section-head" style={{ marginTop: 28 }}>
            <div>
              <h2>Comparison by criteria</h2>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Click any dot to tune criteria scores and watch the weighted score update live.
              </span>
            </div>
          </div>
          <table className="criteria-table">
            <thead>
              <tr><th>Criteria</th>{board.options.map((option) => <th key={option.id}>{option.title}</th>)}</tr>
            </thead>
            <tbody>
              {FACTORS.map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  {board.options.map((option, optIdx) => {
                    const currentVal = criteriaScores[optIdx] ? criteriaScores[optIdx][key] : option[key];
                    return (
                      <td key={option.id} className="score">
                        <DotRow
                          score={currentVal}
                          onScoreChange={(newScore) => handleScoreChange(optIdx, key, newScore)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div id="discussion" style={{ marginTop: 24 }}>
            <Discussion boardId={`demo-${board.id}`} />
          </div>
        </div>

        <aside className="rail">
          <div className="rail-panel">
            <h4>Board info</h4>
            <div className="rail-meta"><span className="k">Created by</span><span>{board.createdByName}</span></div>
            <div className="rail-meta"><span className="k">Category</span><span>{board.category}</span></div>
            <div className="rail-meta"><span className="k">Visibility</span><span>Public</span></div>
            <div className="rail-meta"><span className="k">Poll type</span><span>{board.pollType.replace("_", " ").toLowerCase()}</span></div>
            <div className="rail-meta"><span className="k">Role context</span><span style={{ color: profile.badgeColor, fontWeight: 600 }}>{profile.badge}</span></div>
          </div>

          <div className="rail-panel">
            <h4>Vote breakdown</h4>
            {board.options.map((option, index) => (
              <div className="voter-row" key={option.id}>
                <span className="who">{option.title}</span>
                <span className={`pick ${index === leadingIndex ? "a" : "b"}`}>
                  {total > 0 ? Math.round((votes[index] / total) * 100) : 0}% · {votes[index]}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Interactive Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        board={{ ...board, closed }}
      />
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
    setView("dashboard");
  };

  const handleSwitchPersonaOnDetail = (nextRole) => {
    setRoleKey(nextRole);
    // Find matching board in new role or keep current
    const nextProfile = ROLE_PROFILES[nextRole];
    const match = nextProfile.boards.find((b) => b.id === selected.id);
    if (match) {
      setSelected(match);
    }
  };

  const openBoard = (board) => {
    setSelected(board);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="shell demo-shell">
      <DemoNav active={view} setView={setView} roleKey={roleKey} onSelectRole={handleSelectRole} />
      <main className="demo-main">
        {view === "dashboard" && <DashboardDemo profile={profile} openBoard={openBoard} setView={setView} />}
        {view === "boards" && <BoardsDemo profile={profile} openBoard={openBoard} setView={setView} />}
        {view === "communities" && <CommunitiesDemo profile={profile} openBoard={openBoard} />}
        {view === "moderation" && <ModerationDemo profile={profile} mode="admin" />}
        {view === "content-review" && <ModerationDemo profile={profile} mode="moderator" />}
        {view === "roster" && <CommunityRosterDemo profile={profile} />}
        {view === "exports" && <PollingExportsDemo profile={profile} />}
        {view === "history" && <VotingHistoryDemo profile={profile} />}
        {view === "feedback" && <FeedbackDemo profile={profile} />}
        {view === "detail" && (
          <DetailDemo
            key={`${selected.id}-${roleKey}`}
            board={selected}
            setView={setView}
            profile={profile}
            onSelectRole={handleSwitchPersonaOnDetail}
          />
        )}
      </main>
    </div>
  );
}
