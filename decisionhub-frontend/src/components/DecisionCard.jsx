import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TipBar from "./TipBar";
import { topTwo, timeAgo, getInitials } from "../utils/decisionHelpers";
import { saveDecision, unsaveDecision } from "../api/user";
import ShareModal from "./ShareModal";

export default function DecisionCard({ decision, initialSaved = false, onToggleSave }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initialSaved || decision.isSaved || false);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { a, b, pctA, pctB } = topTwo(decision);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      if (nextSaved) {
        await saveDecision(decision.id);
      } else {
        await unsaveDecision(decision.id);
      }
      if (onToggleSave) onToggleSave(decision.id, nextSaved);
    } catch {
      setSaved(!nextSaved);
    } finally {
      setBusy(false);
    }
  };

  const authorName = decision.createdByName || decision.createdBy;

  return (
    <div
      className="card decision-proposal-card"
      onClick={() => navigate(`/boards/${decision.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/boards/${decision.id}`);
        }
      }}
    >
      <div className="card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="cat">{decision.category}</span>
          {decision.closed ? (
            <span className="status-pill closed">Decision reached</span>
          ) : decision.visibility === "PRIVATE" ? (
            <span className="status-pill private">Private</span>
          ) : (
            <span className="status-pill open">Voting open</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            aria-label="Share decision"
            title="Share decision"
            onClick={(e) => {
              e.stopPropagation();
              setShareOpen(true);
            }}
            className="card-bookmark-btn"
          >
            🔗
          </button>
          <button
            type="button"
            aria-label={saved ? "Remove bookmark" : "Save decision"}
            title={saved ? "Remove bookmark" : "Save decision"}
            onClick={handleBookmark}
            className={`card-bookmark-btn ${saved ? "saved" : ""}`}
          >
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>

      <h3 className="proposal-title">{decision.title}</h3>

      {decision.description && (
        <p className="proposal-snippet">
          {decision.description.length > 120
            ? `${decision.description.slice(0, 118)}…`
            : decision.description}
        </p>
      )}

      <div className="proposal-poll-track">
        {a && b ? (
          <TipBar optionA={a.title} pctA={pctA} optionB={b.title} pctB={pctB} />
        ) : (
          <div className="empty-note">No votes yet — be the first.</div>
        )}
      </div>

      <div className="card-foot">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {authorName && (
            <span className="author-tag" title={`Created by ${authorName}`}>
              <span className="mini-avatar">{getInitials(authorName)}</span>
              <span className="author-name">{authorName.split(" ")[0]}</span>
            </span>
          )}
          <span>{decision.pollType?.replace("_", " ").toLowerCase()}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {decision.createdAt && (
            <time className="proposal-time">{timeAgo(decision.createdAt)}</time>
          )}
          <span className="vote-counter-pill">{decision.totalVotes} votes</span>
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        board={decision}
      />
    </div>
  );
}
