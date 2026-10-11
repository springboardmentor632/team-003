import React, { useEffect, useState } from "react";
import { createSuggestion, listSuggestions } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Suggestions({ boardId }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listSuggestions(boardId).then(({ data }) => setItems(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load suggestions")));
  }, [boardId]);

  const submit = async (event) => {
    event.preventDefault();
    const advice = draft.trim();
    if (!advice) return;
    try { const { data } = await createSuggestion(boardId, { content: advice }); setItems((current) => [data, ...current]); setDraft(""); } catch (err) { setError(extractErrorMessage(err, "Couldn't save suggestion")); }
  };

  return <section className="suggestions panel" aria-labelledby="suggestions-title">
    <div className="section-head"><div><span className="eyebrow">Collective wisdom</span><h2 id="suggestions-title">Suggestions & advice</h2></div><span>{items.length} shared</span></div>
    <form onSubmit={submit} className="suggestion-form"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share a practical recommendation, concern, or next step…" aria-label="Add a suggestion" /><button className="btn brass" disabled={!draft.trim()}>Share advice</button></form>
    {error && <div className="error-banner">{error}</div>}{items.length ? <div className="suggestion-list">{items.map((item) => <article className="suggestion" key={item.id}><div><strong>{item.authorName}</strong><p>{item.advice}</p></div><span className="tag">Advice</span></article>)}</div> : <div className="empty-note">No suggestions yet. Help the group move forward.</div>}
  </section>;
}
