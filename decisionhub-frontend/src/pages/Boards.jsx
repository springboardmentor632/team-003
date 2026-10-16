import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { listPublicDecisions, listMyDecisions } from "../api/decisions";
import { listSavedDecisions } from "../api/user";
import { extractErrorMessage } from "../api/client";

const CATEGORIES = ["All", "Career", "Technology", "Travel", "Finance", "Lifestyle", "Education"];

function dateValue(decision) {
  const date = new Date(decision.createdAt || decision.updatedAt || 0).getTime();
  return Number.isNaN(date) ? 0 : date;
}

export default function Boards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "public";

  const [tab, setTab] = useState(initialTab);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("activity");
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, totalElements: 0 });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["public", "mine", "saved"].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetcher =
      tab === "public"
        ? listPublicDecisions({ category: category === "All" ? undefined : category, page, size: 12 })
        : tab === "saved"
        ? listSavedDecisions()
        : listMyDecisions({ page, size: 12 });

    fetcher
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.content || [];
        setDecisions(list);
        setPageInfo({ totalPages: data.totalPages || 1, totalElements: data.totalElements ?? list.length });
      })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load decision boards")))
      .finally(() => setLoading(false));
  }, [tab, category, page]);

  const selectTab = (nextTab) => {
    setTab(nextTab);
    setPage(0);
    setSearchParams(nextTab === "public" ? {} : { tab: nextTab });
  };

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(0);
  };

  const filteredBoards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = decisions.filter((decision) => {
      const matchesCategory = category === "All" || decision.category === category;
      const matchesStatus = status === "All" || (status === "Open" ? !decision.closed : decision.closed);
      const searchable = [decision.title, decision.category, decision.createdByName, decision.createdBy]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && matchesStatus && (!needle || searchable.includes(needle));
    });

    return result.sort((a, b) => {
      if (sort === "votes") return (b.totalVotes || 0) - (a.totalVotes || 0);
      if (sort === "newest") return dateValue(b) - dateValue(a) || (b.id || 0) - (a.id || 0);
      return (b.totalVotes || 0) - (a.totalVotes || 0) || dateValue(b) - dateValue(a);
    });
  }, [category, decisions, query, sort, status]);

  const resetFilters = () => {
    setCategory("All");
    setStatus("All");
    setQuery("");
    setPage(0);
  };

  return (
    <div className="boards-page">
      <TopBar
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Decision Boards" },
        ]}
        eyebrow="Browse & Compare"
        title="Decision Boards"
        subtitle="Explore active proposals, compare multi-criteria options, and cast your vote."
        action={
          <Link to="/boards/new">
            <button className="btn brass">+ New Decision Board</button>
          </Link>
        }
      />

      <section className="boards-controls" aria-label="Board filters">
        <div className="board-tabs" role="tablist" aria-label="Board source">
          <button
            className={tab === "public" ? "active" : ""}
            onClick={() => selectTab("public")}
            role="tab"
            aria-selected={tab === "public"}
          >
            Explore Proposals
          </button>
          <button
            className={tab === "mine" ? "active" : ""}
            onClick={() => selectTab("mine")}
            role="tab"
            aria-selected={tab === "mine"}
          >
            My Boards
          </button>
          <button
            className={tab === "saved" ? "active" : ""}
            onClick={() => selectTab("saved")}
            role="tab"
            aria-selected={tab === "saved"}
          >
            ★ Saved Boards
          </button>
        </div>

        <div className="board-search-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, category, or creator…"
            aria-label="Search boards"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <label className="sort-select">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort boards">
            <option value="activity">Most active</option>
            <option value="newest">Recently created</option>
            <option value="votes">Most votes</option>
          </select>
        </label>
      </section>

      <div className="filter-groups">
        <div className="filter-set">
          <span className="filter-label">Category</span>
          <div className="filter-row">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                className={`chip ${category === item ? "on" : ""}`}
                onClick={() => selectCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-set">
          <span className="filter-label">Status</span>
          <div className="filter-row">
            {["All", "Open", "Closed"].map((item) => (
              <button
                key={item}
                className={`chip ${status === item ? "on" : ""}`}
                onClick={() => setStatus(item)}
              >
                {item === "Open" ? "Voting Open" : item === "Closed" ? "Decisions Reached" : "All Statuses"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="board-results-head">
          <span>
            {filteredBoards.length} {filteredBoards.length === 1 ? "board" : "boards"} found
          </span>
          {(query || category !== "All" || status !== "All") && (
            <button className="text-button" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="state-block">Loading boards…</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : filteredBoards.length === 0 ? (
        <div className="state-block board-empty">
          <span className="empty-icon">⌕</span>
          <h3>No boards match these filters</h3>
          <p>Try searching for a different keyword or reset filters to view all proposals.</p>
          <button className="btn ghost" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="card-grid board-card-grid">
          {filteredBoards.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}

      {!loading && !error && pageInfo.totalPages > 1 && (
        <div className="detail-actions" style={{ marginTop: 28, justifyContent: "center" }}>
          <button
            className="btn ghost"
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            ← Previous
          </button>
          <span className="tag" style={{ padding: "8px 16px" }}>
            Page {page + 1} of {pageInfo.totalPages} · {pageInfo.totalElements} total boards
          </span>
          <button
            className="btn ghost"
            disabled={page >= pageInfo.totalPages - 1}
            onClick={() => setPage((value) => value + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
