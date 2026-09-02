import React from "react";
import TopBar from "../components/TopBar";

const PREVIEW_COMMUNITIES = [
  { name: "Career Climbers", category: "Career", members: 2300 },
  { name: "Tech Talk", category: "Technology", members: 1800 },
  { name: "Wanderlust", category: "Travel", members: 3100 },
  { name: "Money Matters", category: "Finance", members: 950 },
];

export default function Communities() {
  return (
    <div>
      <TopBar
        eyebrow="Preview"
        title="Communities"
        subtitle="Find your people and vote together on the decisions that matter to them."
      />

      <div className="error-banner" style={{ background: "var(--brass-dim)", borderColor: "var(--brass)", color: "#7A5A1E" }}>
        Communities aren't wired up to the backend yet — this is a preview of the design.
        The board's `communityId` field is already in place for when this ships.
      </div>

      <div className="card-grid">
        {PREVIEW_COMMUNITIES.map((c) => (
          <div className="card" key={c.name} style={{ cursor: "default" }}>
            <div className="card-top">
              <span className="cat">{c.category}</span>
            </div>
            <h3>{c.name}</h3>
            <div className="card-foot">
              <span>{(c.members / 1000).toFixed(1)}k members</span>
              <span style={{ color: "var(--ink-soft)" }}>Coming soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
