import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { acceptInvitation, createCommunity, declineInvitation, joinCommunity, leaveCommunity, listCommunities, listInvitations } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]); const [success, setSuccess] = useState("");
  const load = () => listCommunities().then(({ data }) => setCommunities(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load communities"))).finally(() => setLoading(false));
  useEffect(() => { load(); listInvitations().then(({ data }) => setInvitations(data)).catch(() => {}); }, []);
  const create = async (event) => {
    event.preventDefault(); setError("");
    try { const { data } = await createCommunity({ name, description }); setCommunities((items) => [data, ...items]); setName(""); setDescription(""); setShowForm(false); }
    catch (err) { setError(extractErrorMessage(err, "Couldn't create community")); }
  };
  const toggleMembership = async (community) => {
    try { const { data } = community.joined ? await leaveCommunity(community.id) : await joinCommunity(community.id); setCommunities((items) => items.map((item) => item.id === community.id ? data : item)); }
    catch (err) { setError(extractErrorMessage(err, "Couldn't update membership")); }
  };
  const respond = async (invitation, accept) => { try { if (accept) await acceptInvitation(invitation.id); else await declineInvitation(invitation.id); setInvitations((items) => items.filter((item) => item.id !== invitation.id)); setSuccess(accept ? `You joined ${invitation.community?.name || "the community"}.` : "Invitation declined."); if (accept) load(); } catch (err) { setError(extractErrorMessage(err, "Couldn't update invitation")); } };
  return <div>
    <TopBar eyebrow="Collaborate" title="Communities" subtitle="Bring people together around decisions they care about." action={<button className="btn brass" onClick={() => setShowForm((value) => !value)}>+ New community</button>} />
    {error && <div className="error-banner">{error}</div>}
    {success && <div className="success-note">{success}</div>}
    {invitations.length > 0 && <section className="panel invitations"><div className="section-head"><div><span className="eyebrow">Pending invitations</span><h2>Join a community</h2></div><span>{invitations.length}</span></div>{invitations.map((invitation) => <div className="invitation-row" key={invitation.id}><div><h3>{invitation.community?.name || "Community invitation"}</h3><p>You’ve been invited to collaborate on decisions.</p></div><div className="detail-actions"><button className="btn ghost" onClick={() => respond(invitation, false)}>Decline</button><button className="btn brass" onClick={() => respond(invitation, true)}>Accept</button></div></div>)}</section>}
    {showForm && <form className="form-card" onSubmit={create} style={{ marginBottom: 24 }}><div className="field"><label>Name</label><input value={name} required onChange={(e) => setName(e.target.value)} placeholder="e.g. Product leaders" /></div><div className="field"><label>Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What brings this group together?" /></div><button className="btn brass" type="submit">Create community</button></form>}
    {loading ? <div className="state-block">Loading communities…</div> : communities.length === 0 ? <div className="state-block"><h3>No communities yet</h3><p>Create the first space for shared decisions.</p></div> : <div className="card-grid">{communities.map((community) => <article className="card" key={community.id} onClick={() => navigate(`/communities/${community.id}`)}><div className="card-top"><span className="cat">Community</span><span>{community.memberCount} members</span></div><h3>{community.name}</h3><p>{community.description || "A place to compare options and decide together."}</p><div className="card-foot"><span>{community.joined ? "You’re a member" : "Open to join"}</span><button className="btn ghost" onClick={(event) => { event.stopPropagation(); toggleMembership(community); }}>{community.joined ? "Leave" : "Join"}</button></div></article>)}</div>}
  </div>;
}
