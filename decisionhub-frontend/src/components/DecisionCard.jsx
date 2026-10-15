import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TipBar from "./TipBar";
import { topTwo } from "../utils/decisionHelpers";
import { saveDecision, unsaveDecision } from "../api/user";

export default function DecisionCard({ decision, initialSaved = false, onToggleSave }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initialSaved || decision.isSaved || false);
  const [busy, setBusy] = useState(false);
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

  return (
    <div className="card" onClick={() => navigate(`/boards/${decision.id}`)}>
      <div className="card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="cat">{decision.category}</span>
          {decision.closed ? (
            <span className="status-pill closed">Decision reached</span>
          ) : decision.visibility === "PRIVATE" ? (
            <span className="status-pill private">Private</span>
          ) : (
            <span className="status-pill open">Voting open</span>
          )}
        </div>
        <button
          type="button"
          aria-label={saved ? "Remove bookmark" : "Save decision"}
          title={saved ? "Remove bookmark" : "Bookmark this decision"}
          onClick={handleBookmark}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: saved ? "var(--brass, #d4a373)" : "var(--ink-soft, #888)",
            padding: 4,
            transition: "transform 0.15s ease",
          }}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>
      <h3>{decision.title}</h3>

      {a && b ? (
        <TipBar optionA={a.title} pctA={pctA} optionB={b.title} pctB={pctB} />
      ) : (
        <div className="empty-note">No votes yet — be the first.</div>
      )}

      <div className="card-foot">
        <span>{decision.pollType?.replace("_", " ").toLowerCase()}</span>
        <span>{decision.totalVotes} votes</span>
      </div>
    </div>
  );
}
