import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { createCommunity, joinCommunity, leaveCommunity, listCommunities } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = () => listCommunities().then(({ data }) => setCommunities(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load communities"))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const create = async (event) => {
    event.preventDefault(); setError("");
    try { const { data } = await createCommunity({ name, description }); setCommunities((items) => [data, ...items]); setName(""); setDescription(""); setShowForm(false); }
    catch (err) { setError(extractErrorMessage(err, "Couldn't create community")); }
  };
  const toggleMembership = async (community) => {
    try { const { data } = community.joined ? await leaveCommunity(community.id) : await joinCommunity(community.id); setCommunities((items) => items.map((item) => item.id === community.id ? data : item)); }
    catch (err) { setError(extractErrorMessage(err, "Couldn't update membership")); }
  };
  return <div>
    <TopBar eyebrow="Collaborate" title="Communities" subtitle="Bring people together around decisions they care about." action={<button className="btn brass" onClick={() => setShowForm((value) => !value)}>+ New community</button>} />
    {error && <div className="error-banner">{error}</div>}
    {showForm && <form className="form-card" onSubmit={create} style={{ marginBottom: 24 }}><div className="field"><label>Name</label><input value={name} required onChange={(e) => setName(e.target.value)} placeholder="e.g. Product leaders" /></div><div className="field"><label>Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What brings this group together?" /></div><button className="btn brass" type="submit">Create community</button></form>}
    {loading ? <div className="state-block">Loading communities…</div> : communities.length === 0 ? <div className="state-block"><h3>No communities yet</h3><p>Create the first space for shared decisions.</p></div> : <div className="card-grid">{communities.map((community) => <article className="card" key={community.id}><div className="card-top"><span className="cat">Community</span><span>{community.memberCount} members</span></div><h3>{community.name}</h3><p>{community.description || "A place to compare options and decide together."}</p><div className="card-foot"><span>{community.joined ? "You’re a member" : "Open to join"}</span><button className="btn ghost" onClick={() => toggleMembership(community)}>{community.joined ? "Leave" : "Join"}</button></div></article>)}</div>}
  </div>;
}
