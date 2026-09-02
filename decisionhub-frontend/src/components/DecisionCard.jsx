import React from "react";
import { useNavigate } from "react-router-dom";
import TipBar from "./TipBar";
import { topTwo } from "../utils/decisionHelpers";

export default function DecisionCard({ decision }) {
  const navigate = useNavigate();
  const { a, b, pctA, pctB } = topTwo(decision);

  return (
    <div className="card" onClick={() => navigate(`/boards/${decision.id}`)}>
      <div className="card-top">
        <span className="cat">{decision.category}</span>
        {decision.closed ? (
          <span className="status-pill closed">Decision reached</span>
        ) : decision.visibility === "PRIVATE" ? (
          <span className="status-pill private">Private</span>
        ) : (
          <span className="status-pill open">Voting open</span>
        )}
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
