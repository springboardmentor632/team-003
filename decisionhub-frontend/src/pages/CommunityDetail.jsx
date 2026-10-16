import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import DecisionCard from "../components/DecisionCard";
import { getCommunity, joinCommunity, leaveCommunity, inviteCommunityMember } from "../api/collaboration";
import { listCommunityDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    Promise.all([getCommunity(id), listCommunityDecisions(id)])
      .then(([communityResponse, boardsResponse]) => {
        setCommunity(communityResponse.data);
        setBoards(boardsResponse.data);
      })
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

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteBusy(true);
    setInviteError("");
    setInviteMessage("");
    try {
      await inviteCommunityMember(community.id, inviteEmail.trim());
      setInviteMessage(`Invitation sent to ${inviteEmail.trim()} successfully.`);
      setInviteEmail("");
    } catch (err) {
      setInviteError(extractErrorMessage(err, "Failed to send invitation"));
    } finally {
      setInviteBusy(false);
    }
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!community) return <div className="state-block">Loading community…</div>;

  const isAdmin = Boolean(user && user.role === "ADMIN");
  const isOwner = Boolean(
    isAdmin ||
    community.memberRole === "OWNER" ||
    (community.owner && (community.owner.id === user?.id || community.owner.email === user?.email))
  );
  const isModerator = Boolean(isOwner || community.memberRole === "MODERATOR");
  const boardUrl = `/boards/new?communityId=${community.id}&communityName=${encodeURIComponent(community.name)}`;

  return (
    <div>
      <TopBar
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: "Communities", to: "/communities" },
          { label: community.name },
        ]}
        eyebrow="Community workspace"
        title={community.name}
        subtitle={community.description || "Make shared decisions with your community."}
        action={
          <div className="detail-actions">
            {community.joined ? (
              <>
                {isModerator && (
                  <Link className="btn ghost" to={`/reports?communityId=${community.id}`}>
                    Moderation
                  </Link>
                )}
                {isModerator && (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setShowInviteModal((prev) => !prev);
                      setInviteError("");
                      setInviteMessage("");
                    }}
                  >
                    {showInviteModal ? "Close Invite" : "+ Invite Member"}
                  </button>
                )}
                <button className="btn brass" onClick={() => navigate(boardUrl)}>
                  + Create community board
                </button>
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
        {isAdmin && (
          <span className="tag" style={{ background: "rgba(124, 58, 237, 0.12)", color: "#7c3aed", fontWeight: 600 }}>
            🛡️ Global Admin Mode
          </span>
        )}
        {!isAdmin && isOwner && (
          <span className="tag" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706", fontWeight: 600 }}>
            👑 Community Owner
          </span>
        )}
        {!isAdmin && !isOwner && isModerator && (
          <span className="tag" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7", fontWeight: 600 }}>
            ⚖️ Community Moderator
          </span>
        )}
        {!isAdmin && !isOwner && !isModerator && community.joined && (
          <span className="tag" style={{ background: "rgba(0, 137, 123, 0.12)", color: "var(--brass)", fontWeight: 600 }}>
            👤 Community Member
          </span>
        )}
        <span className="tag">{community.memberCount} member{community.memberCount === 1 ? "" : "s"}</span>
        <span className={`tag ${community.joined ? "brass" : ""}`}>
          {community.joined ? "✓ You are a member — create, vote, and discuss." : "Join the community to participate."}
        </span>
      </div>

      {/* Role-Specific Leadership: Inline Member Invitation */}
      {showInviteModal && isModerator && (
        <form
          onSubmit={handleSendInvite}
          style={{
            marginBottom: 20,
            padding: 16,
            background: "var(--paper-raised)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "var(--ink)" }}>
            Invite a new member to {community.name}
          </div>
          {inviteMessage && <div className="success-note" style={{ marginBottom: 10 }}>✓ {inviteMessage}</div>}
          {inviteError && <div className="error-banner" style={{ marginBottom: 10 }}>{inviteError}</div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@organization.org"
              style={{ flex: "1 1 240px" }}
            />
            <button type="submit" className="btn brass" disabled={inviteBusy}>
              {inviteBusy ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      )}

      <div className="section-head">
        <h2>Community decision boards</h2>
        <span>{boards.length} board{boards.length === 1 ? "" : "s"}</span>
      </div>

      {boards.length ? (
        <div className="card-grid">
          {boards.map((board) => (
            <DecisionCard key={board.id} decision={board} />
          ))}
        </div>
      ) : (
        <div className="state-block">
          <h3>No decision boards yet</h3>
          <p>Start the first shared decision for this community.</p>
          {community.joined ? (
            <button className="btn brass" onClick={() => navigate(boardUrl)}>
              Create a decision board
            </button>
          ) : (
            <button className="btn community-join-btn btn-join" onClick={toggleMembership} disabled={busy}>
              {busy ? "Joining…" : "Join to create a board"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
