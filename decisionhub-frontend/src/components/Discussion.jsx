import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createComment, deleteComment, listComments, reactToComment, updateComment } from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { timeAgo, getAvatarUrl } from "../utils/decisionHelpers";

function initials(name = "?") { return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function CommentNode({ comment, children, onReply, onReact, onEdit, onDelete, canManage, canEdit, depth = 0 }) {
  const avatar = comment.authorAvatarUrl || getAvatarUrl(comment.authorName);
  return <article className={`comment ${depth ? "comment-reply" : ""}`} key={comment.id}>
    <div className="avatar comment-avatar" style={{ overflow: "hidden", position: "relative" }}>
      {avatar && (
        <img
          src={avatar}
          alt={comment.authorName}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <span style={{ position: "absolute" }}>{initials(comment.authorName)}</span>
    </div>
    <div className="comment-body"><div className="comment-meta"><span className="who">{comment.authorName}</span><span>{timeAgo(comment.createdAt)}</span>{comment.hidden && <span className="hidden-comment-label">Hidden from members</span>}</div>
      {depth > 0 && <div className="comment-reply-label">Reply</div>}<p>{comment.body}</p>
      <div className="comment-actions"><button type="button" onClick={() => onReact(comment.id)}>♡ {comment.reactionCount || 0}</button><button type="button" onClick={() => onReply(comment)}>Reply</button>{canEdit(comment) && <button type="button" onClick={() => onEdit(comment)}>Edit</button>}{canManage(comment) && <button type="button" onClick={() => onDelete(comment)}>Delete</button>}</div>
      {children?.length > 0 && <div className="comment-children">{children.map((child) => <CommentNode key={child.id} comment={child} children={child.children} onReply={onReply} onReact={onReact} onEdit={onEdit} onDelete={onDelete} canManage={canManage} canEdit={canEdit} depth={depth + 1} />)}</div>}
    </div>
  </article>;
}

const DEMO_SEEDS = [
  {
    id: 9001,
    authorName: "Sarah Chen",
    authorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    body: "The weighted comparison criteria align well with our quarterly goals. Latency and operational risk benchmarks look dependable.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reactionCount: 4,
    parentCommentId: null,
  },
  {
    id: 9002,
    authorName: "Devon Vance",
    authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    body: "@Sarah Agreed. The pilot validation confirms our scalability estimates.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactionCount: 2,
    parentCommentId: 9001,
  },
  {
    id: 9003,
    authorName: "Arjun Mehta",
    authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    body: "Reminder to all circle members: please submit your final votes before the consensus deadline this Friday.",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    reactionCount: 3,
    parentCommentId: null,
  },
];

export default function Discussion({ boardId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const composerRef = useRef(null);

  const isDemo = !boardId || isNaN(Number(boardId)) || String(boardId).startsWith("demo-");

  const load = () => {
    if (isDemo) {
      setLoading(false);
      setError("");
      setComments(DEMO_SEEDS);
      return;
    }
    setLoading(true);
    listComments(boardId)
      .then(({ data }) => setComments(data))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load comments")))
      .finally(() => setLoading(false));
  };
  useEffect(() => { setDraft(""); setReplyTo(null); setError(""); load(); }, [boardId]);
  const count = useMemo(() => `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`, [comments]);
  const threadRoots = useMemo(() => {
    const byId = new Map(comments.map((comment) => [comment.id, { ...comment, children: [] }]));
    const roots = [];
    byId.forEach((comment) => {
      const parent = comment.parentCommentId && byId.get(comment.parentCommentId);
      if (parent) parent.children.push(comment); else roots.push(comment);
    });
    return roots;
  }, [comments]);

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    if (isDemo) {
      const authorName = user?.fullName || user?.name || "Community Member";
      const newComment = {
        id: Date.now(),
        authorName,
        authorAvatarUrl: user?.avatarUrl || getAvatarUrl(authorName),
        body: draft.trim(),
        createdAt: new Date().toISOString(),
        reactionCount: 0,
        parentCommentId: replyTo?.id || null,
      };
      setComments((items) => [...items, newComment]);
      setDraft("");
      setReplyTo(null);
      return;
    }
    try {
      const { data } = await createComment(boardId, { content: draft.trim(), parentCommentId: replyTo?.id });
      setComments((items) => [...items, data]);
      setDraft(""); setReplyTo(null);
    } catch (err) { setError(extractErrorMessage(err, "Couldn't post your comment")); }
  };
  const react = async (id) => {
    if (isDemo) {
      setComments((items) =>
        items.map((item) => (item.id === id ? { ...item, reactionCount: (item.reactionCount || 0) + 1 } : item))
      );
      return;
    }
    try {
      const { data } = await reactToComment(boardId, id);
      setComments((items) => items.map((item) => item.id === id ? data : item));
    } catch (err) { setError(extractErrorMessage(err, "Couldn't add your reaction")); }
  };
  const startReply = (comment) => { setReplyTo(comment); setDraft(`@${comment.authorName.split(" ")[0]} `); requestAnimationFrame(() => composerRef.current?.focus()); };
  const edit = async (comment) => {
    const content = window.prompt("Edit comment", comment.body);
    if (!content?.trim()) return;
    if (isDemo) {
      setComments((all) =>
        all.map((item) => (item.id === comment.id ? { ...item, body: content.trim() } : item))
      );
      return;
    }
    try {
      const { data } = await updateComment(boardId, comment.id, { content });
      setComments((all) => all.map((item) => item.id === data.id ? data : item));
    } catch (err) { setError(extractErrorMessage(err, "Couldn't edit comment")); }
  };
  const remove = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;
    if (isDemo) {
      setComments((all) => all.filter((item) => item.id !== comment.id));
      return;
    }
    try {
      await deleteComment(boardId, comment.id);
      setComments((all) => all.filter((item) => item.id !== comment.id));
    } catch (err) { setError(extractErrorMessage(err, "Couldn't delete comment")); }
  };

  const userAvatar = user?.avatarUrl || getAvatarUrl(user?.fullName || "You");

  return (
    <section className="discussion" id="discussion">
      <div className="discussion-head"><div><span className="eyebrow">Community notes</span><h3>Discussion <span>{count}</span></h3></div><span className="discussion-live"><i /> Live conversation</span></div>
      {error && <div className="error-banner">{error}</div>}
      <form className="comment-composer" onSubmit={submit}>
        <div className="avatar current-avatar" style={{ overflow: "hidden", position: "relative" }}>
          {userAvatar && (
            <img
              src={userAvatar}
              alt={user?.fullName || "You"}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <span style={{ position: "absolute" }}>{initials(user?.fullName || "You")}</span>
        </div>
        <div className="composer-main">
          {replyTo && <div className="replying-to">Replying to {replyTo.authorName}<button type="button" onClick={() => { setReplyTo(null); setDraft(""); }} aria-label="Cancel reply">×</button></div>}
          <textarea ref={composerRef} rows="3" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share context, ask a question, or help the group decide…" aria-label="Add a comment" />
          <div className="composer-actions"><span>Be constructive and specific.</span><button className="btn brass" type="submit" disabled={!draft.trim()}>Post comment <b>↵</b></button></div>
        </div>
      </form>
      <div className="comment-list">
        {loading ? <div className="empty-note">Loading conversation…</div> : comments.length === 0 ? <div className="empty-note">Start the conversation.</div> : threadRoots.map((comment) => <CommentNode key={comment.id} comment={comment} children={comment.children} onReply={startReply} onReact={react} onEdit={edit} onDelete={remove} canManage={(item) => item.authorName === user?.fullName || user?.role === "ADMIN" || user?.role === "MODERATOR"} canEdit={(item) => item.authorName === user?.fullName} />)}
      </div>
    </section>
  );
}
