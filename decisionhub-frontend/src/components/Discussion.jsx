import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createComment, listComments, reactToComment } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { timeAgo } from "../utils/decisionHelpers";

function initials(name = "?") { return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

export default function Discussion({ boardId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const composerRef = useRef(null);

  const load = () => {
    setLoading(true);
    listComments(boardId).then(({ data }) => setComments(data)).catch((err) => setError(extractErrorMessage(err, "Couldn't load comments"))).finally(() => setLoading(false));
  };
  useEffect(() => { setDraft(""); setReplyTo(null); setError(""); load(); }, [boardId]);
  const count = useMemo(() => `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`, [comments]);

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    try {
      const { data } = await createComment(boardId, { content: draft.trim(), parentCommentId: replyTo?.id });
      setComments((items) => [...items, data]);
      setDraft(""); setReplyTo(null);
    } catch (err) { setError(extractErrorMessage(err, "Couldn't post your comment")); }
  };
  const react = async (id) => {
    try {
      const { data } = await reactToComment(boardId, id);
      setComments((items) => items.map((item) => item.id === id ? data : item));
    } catch (err) { setError(extractErrorMessage(err, "Couldn't add your reaction")); }
  };
  const startReply = (comment) => { setReplyTo(comment); setDraft(`@${comment.authorName.split(" ")[0]} `); requestAnimationFrame(() => composerRef.current?.focus()); };

  return (
    <section className="discussion" id="discussion">
      <div className="discussion-head"><div><span className="eyebrow">Community notes</span><h3>Discussion <span>{count}</span></h3></div><span className="discussion-live"><i /> Live conversation</span></div>
      {error && <div className="error-banner">{error}</div>}
      <form className="comment-composer" onSubmit={submit}>
        <div className="avatar current-avatar">{initials(user?.fullName || "You")}</div>
        <div className="composer-main">
          {replyTo && <div className="replying-to">Replying to {replyTo.authorName}<button type="button" onClick={() => { setReplyTo(null); setDraft(""); }} aria-label="Cancel reply">×</button></div>}
          <textarea ref={composerRef} rows="3" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share context, ask a question, or help the group decide…" aria-label="Add a comment" />
          <div className="composer-actions"><span>Be constructive and specific.</span><button className="btn brass" type="submit" disabled={!draft.trim()}>Post comment <b>↵</b></button></div>
        </div>
      </form>
      <div className="comment-list">
        {loading ? <div className="empty-note">Loading conversation…</div> : comments.length === 0 ? <div className="empty-note">Start the conversation.</div> : comments.map((comment) => (
          <article className="comment" key={comment.id}>
            <div className="avatar comment-avatar">{initials(comment.authorName)}</div>
            <div className="comment-body"><div className="comment-meta"><span className="who">{comment.authorName}</span><span>{timeAgo(comment.createdAt)}</span></div>
              {comment.parentCommentId && <div className="comment-reply-label">Reply</div>}<p>{comment.body}</p>
              <div className="comment-actions"><button type="button" onClick={() => react(comment.id)}>♡ {comment.reactionCount || 0}</button><button type="button" onClick={() => startReply(comment)}>Reply</button></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
