import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { getCommunity } from "../api/collaboration";
import { listCommunityDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCommunity(id), listCommunityDecisions(id)])
      .then(([communityResponse, boardsResponse]) => { setCommunity(communityResponse.data); setBoards(boardsResponse.data); })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load this community")));
  }, [id]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!community) return <div className="state-block">Loading community…</div>;
  const boardUrl = `/boards/new?communityId=${community.id}&communityName=${encodeURIComponent(community.name)}`;
  return <div>
    <div className="breadcrumb"><Link to="/communities" style={{ color: "inherit", textDecoration: "none" }}>Communities</Link><span> / </span><b>{community.name}</b></div>
    <TopBar eyebrow="Community workspace" title={community.name} subtitle={community.description || "Make shared decisions with your community."} action={community.joined ? <button className="btn brass" onClick={() => navigate(boardUrl)}>+ Create community board</button> : null} />
    <div className="detail-actions" style={{ marginBottom: 20 }}><span className="tag">{community.memberCount} members</span><span className="tag">{community.joined ? "You are a member — create, vote, and discuss." : "Join the community to create a board."}</span></div>
    <div className="section-head"><h2>Community decision boards</h2><span>{boards.length} board{boards.length === 1 ? "" : "s"}</span></div>
    {boards.length ? <div className="card-grid">{boards.map((board) => <DecisionCard key={board.id} decision={board} />)}</div> : <div className="state-block"><h3>No decision boards yet</h3><p>Start the first shared decision for this community.</p>{community.joined && <button className="btn brass" onClick={() => navigate(boardUrl)}>Create a decision board</button>}</div>}
  </div>;
}
