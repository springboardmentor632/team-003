import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { getCommunity, joinCommunity, leaveCommunity } from "../api/collaboration";
import { listCommunityDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getCommunity(id), listCommunityDecisions(id)])
      .then(([communityResponse, boardsResponse]) => { setCommunity(communityResponse.data); setBoards(boardsResponse.data); })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load this community")));
  }, [id]);

  const toggleMembership = async () => {
    if (!community) return;
    setBusy(true);
    setError("");
    try {
      const { data } = community.joined ? await leaveCommunity(community.id) : await joinCommunity(community.id);
      setCommunity(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update community membership"));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!community) return <div className="state-block">Loading community…</div>;
  const boardUrl = `/boards/new?communityId=${community.id}&communityName=${encodeURIComponent(community.name)}`;
  return <div>
    <TopBar
      breadcrumbs={[
        { label: "Workspace", to: "/dashboard" },
        { label: "Communities", to: "/communities" },
        { label: community.name }
      ]}
      eyebrow="Community workspace"
      title={community.name}
      subtitle={community.description || "Make shared decisions with your community."}
      action={
        <div className="detail-actions">
          {community.joined ? (
            <>
              {["OWNER", "MODERATOR"].includes(community.memberRole) && <Link className="btn ghost" to={`/reports?communityId=${community.id}`}>Moderation</Link>}
              <button className="btn brass" onClick={() => navigate(boardUrl)}>+ Create community board</button>
              <button
                type="button"
                className="btn community-join-btn btn-leave"
                onClick={toggleMembership}
                disabled={busy}
                title="Leave this community"
              >
                {busy ? "Leaving…" : "Leave"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn community-join-btn btn-join"
              onClick={toggleMembership}
              disabled={busy}
              title="Join this community"
            >
              {busy ? "Joining…" : "Join Community"}
            </button>
          )}
        </div>
      }
    />
    <div className="detail-actions" style={{ marginBottom: 20 }}>
      <span className="tag">{community.memberCount} member{community.memberCount === 1 ? "" : "s"}</span>
      <span className={`tag ${community.joined ? "brass" : ""}`}>
        {community.joined ? "✓ You are a member — create, vote, and discuss." : "Join the community to participate."}
      </span>
    </div>
    <div className="section-head"><h2>Community decision boards</h2><span>{boards.length} board{boards.length === 1 ? "" : "s"}</span></div>
    {boards.length ? (
      <div className="card-grid">{boards.map((board) => <DecisionCard key={board.id} decision={board} />)}</div>
    ) : (
      <div className="state-block">
        <h3>No decision boards yet</h3>
        <p>Start the first shared decision for this community.</p>
        {community.joined ? (
          <button className="btn brass" onClick={() => navigate(boardUrl)}>Create a decision board</button>
        ) : (
          <button className="btn community-join-btn btn-join" onClick={toggleMembership} disabled={busy}>
            {busy ? "Joining…" : "Join to create a board"}
          </button>
        )}
      </div>
    )}
  </div>;
}
