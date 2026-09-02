import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { listPublicDecisions, listMyDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

const CATEGORIES = ["All", "Career", "Technology", "Travel", "Finance", "Lifestyle", "Education"];

export default function Boards() {
  const [tab, setTab] = useState("public"); // "public" | "mine"
  const [category, setCategory] = useState("All");
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetcher = tab === "public"
      ? listPublicDecisions({ category: category === "All" ? undefined : category, size: 50 })
      : listMyDecisions({ size: 50 });

    fetcher
      .then(({ data }) => setDecisions(data.content || []))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load decision boards")))
      .finally(() => setLoading(false));
  }, [tab, category]);

  return (
    <div>
      <TopBar
        eyebrow="Browse"
        title="Decision boards"
        subtitle="Every board the community is weighing in on right now."
        action={<Link to="/boards/new"><button className="btn brass">+ New decision board</button></Link>}
      />

      <div className="section-head">
        <div className="filter-row">
          <button className={`chip ${tab === "public" ? "on" : ""}`} onClick={() => setTab("public")}>Public boards</button>
          <button className={`chip ${tab === "mine" ? "on" : ""}`} onClick={() => setTab("mine")}>My boards</button>
        </div>
        {tab === "public" && (
          <div className="filter-row">
            {CATEGORIES.map((c) => (
              <button key={c} className={`chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="state-block">Loading boards…</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : decisions.length === 0 ? (
        <div className="state-block">
          <h3>No boards here yet</h3>
          <p>{tab === "mine" ? "You haven't created a decision board yet." : "No public boards in this category yet."}</p>
        </div>
      ) : (
        <div className="card-grid">
          {decisions.map((d) => <DecisionCard key={d.id} decision={d} />)}
        </div>
      )}
    </div>
  );
}
