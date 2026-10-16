import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { createFeedback, listFeedback } from "../api/collaboration";
import { listMyDecisions, listPublicDecisions } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState([]); const [decisionId, setDecisionId] = useState("");
  useEffect(() => { listFeedback().then(({ data }) => setItems(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load feedback"))); Promise.all([listPublicDecisions(), listMyDecisions()]).then(([publicBoards, mine]) => setDecisions([...publicBoards.data.content, ...mine.data.content].filter((board, index, all) => all.findIndex((item) => item.id === board.id) === index))).catch(() => {}); }, []);
  const submit = async (event) => {
    event.preventDefault();
    const text = message.trim(); if (!text) return;
    try { const { data } = await createFeedback({ message: text, decisionId: decisionId || undefined }); setItems((current) => [data, ...current]); setMessage(""); setDecisionId(""); setSent(true); } catch (err) { setError(extractErrorMessage(err, "Couldn't send feedback")); }
  };
  return <div><TopBar eyebrow="Make DecisionHub better" title="Feedback" subtitle="Share what is working, what is missing, or an idea worth trying." />
    <div className="feedback-layout"><form className="form-card" onSubmit={submit}><div className="field"><label htmlFor="feedback-message">Your feedback</label><textarea id="feedback-message" value={message} onChange={(event) => { setMessage(event.target.value); setSent(false); }} required rows="6" placeholder="Tell us about your experience…" /></div><div className="field"><label htmlFor="feedback-decision">Related decision (optional)</label><select id="feedback-decision" value={decisionId} onChange={(event) => setDecisionId(event.target.value)}><option value="">General feedback</option>{decisions.map((board) => <option key={board.id} value={board.id}>{board.title}</option>)}</select></div><button className="btn brass" type="submit">Send feedback</button>{sent && <p className="success-note">Thanks — your feedback was saved.</p>}{error && <div className="error-banner">{error}</div>}</form>
      <section className="panel"><h3>Your recent feedback</h3>{items.length ? <div className="feedback-list">{items.map((item) => <article key={item.id}><div><strong>{item.authorName}</strong><p>{item.message}</p></div><span className="tag">{item.status || "OPEN"}</span></article>)}</div> : <div className="empty-note">Your submitted feedback will appear here.</div>}</section></div>
  </div>;
}
