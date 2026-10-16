import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import { listVotingHistory } from "../api/user";
import { extractErrorMessage } from "../api/client";
import { timeAgo } from "../utils/decisionHelpers";

export default function VotingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;
    listVotingHistory()
      .then(({ data }) => {
        if (!active) return;
        setHistory(data || []);
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, "Couldn't load your voting history"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(history.map((h) => h.decisionCategory).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [history]);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((item) => {
      const matchCat = selectedCategory === "All" || item.decisionCategory === selectedCategory;
      const matchQuery =
        !q ||
        (item.decisionTitle && item.decisionTitle.toLowerCase().includes(q)) ||
        (item.optionTitle && item.optionTitle.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [history, query, selectedCategory]);

  const uniqueDecisionsCount = useMemo(() => {
    return new Set(history.map((h) => h.decisionId).filter(Boolean)).size;
  }, [history]);

  const averageRating = useMemo(() => {
    const rated = history.filter((h) => h.rating != null);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, h) => acc + h.rating, 0);
    return (sum / rated.length).toFixed(1);
  }, [history]);

  const categoriesCount = useMemo(() => {
    return new Set(history.map((h) => h.decisionCategory).filter(Boolean)).size;
  }, [history]);

  return (
    <div>
      <TopBar
        eyebrow="Audit & Transparency"
        title="Personal Voting History"
        subtitle="A complete chronological audit log of all your ballot submissions, option selections, and rating scores."
      />

      <div className="stats dashboard-stats" style={{ marginBottom: 24 }}>
        <div className="stat">
          <div className="num display">{history.length}</div>
          <div className="lbl">Total Votes Cast</div>
        </div>
        <div className="stat">
          <div className="num display">{uniqueDecisionsCount}</div>
          <div className="lbl">Decisions Participated In</div>
        </div>
        <div className="stat">
          <div className="num display">{averageRating ? `${averageRating} / 5` : "—"}</div>
          <div className="lbl">Average Rating Score</div>
        </div>
        <div className="stat">
          <div className="num display">{categoriesCount}</div>
          <div className="lbl">Categories Explored</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-soft)" }}>Filter Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`tag ${selectedCategory === cat ? "active" : ""}`}
                style={{
                  cursor: "pointer",
                  background: selectedCategory === cat ? "var(--brass-soft)" : "transparent",
                  color: selectedCategory === cat ? "var(--brass)" : "var(--ink-soft)",
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  border: selectedCategory === cat ? "1px solid var(--brass)" : "1px solid var(--border)",
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ minWidth: 240 }}>
            <input
              type="search"
              className="input"
              placeholder="Search past ballots…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ fontSize: 13, padding: "7px 12px" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="state-block">Loading voting history…</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="state-block dashboard-empty">
            <span className="empty-icon">✓</span>
            <h3>No voting records found</h3>
            <p>
              {history.length === 0
                ? "You haven't participated in any decision polls yet."
                : "No past votes match your search filter."}
            </p>
            {history.length === 0 && (
              <Link to="/boards">
                <button className="btn brass">Browse Decision Boards</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-soft)" }}>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Decision Board</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Poll Type</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Option Selected / Score</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Voted</th>
                  <th style={{ padding: "12px 10px", fontWeight: 600 }}>Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.voteId}
                    style={{
                      borderBottom: "1px solid var(--border-soft, #f0f0f0)",
                      transition: "background 0.1s",
                    }}
                  >
                    <td style={{ padding: "12px 10px", fontWeight: 500 }}>
                      <Link
                        to={`/boards/${item.decisionId}`}
                        style={{ color: "var(--brass)", textDecoration: "none" }}
                      >
                        {item.decisionTitle || `Decision #${item.decisionId}`}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className="tag" style={{ fontSize: 11 }}>
                        {item.decisionCategory || "General"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", textTransform: "capitalize", color: "var(--ink-soft)" }}>
                      {item.pollType ? item.pollType.replace("_", " ").toLowerCase() : "Single choice"}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <strong style={{ color: "var(--ink)" }}>{item.optionTitle || "Option"}</strong>
                      {item.rating != null && (
                        <span
                          style={{
                            marginLeft: 8,
                            padding: "2px 8px",
                            background: "var(--brass-soft)",
                            color: "var(--brass)",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          ★ {item.rating} / 5
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                      {item.votedAt ? timeAgo(item.votedAt) : "Recently"}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.anonymous ? (
                        <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Anonymous</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--teal)" }}>Public</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
