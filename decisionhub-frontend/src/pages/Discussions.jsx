import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  listDiscussions,
  createDiscussion,
  deleteDiscussion,
  listDiscussionComments,
  createDiscussionComment,
  deleteDiscussionComment,
} from "../api/collaboration";
import { useAuth } from "../context/AuthContext";
import { timeAgo, getInitials, getAvatarUrl } from "../utils/decisionHelpers";
import { extractErrorMessage } from "../api/client";

export function getTopicCategory(title = "", content = "") {
  const text = (String(title || "") + " " + String(content || "")).toLowerCase();
  if (text.includes("kafka") || text.includes("microservices") || text.includes("architecture") || text.includes("rfc") || text.includes("database")) return "Technology";
  if (text.includes("product") || text.includes("canvas") || text.includes("roadmap") || text.includes("slack") || text.includes("teams")) return "Product";
  if (text.includes("remote") || text.includes("workplace") || text.includes("culture") || text.includes("async") || text.includes("hybrid")) return "Workplace";
  if (text.includes("stipend") || text.includes("growth") || text.includes("learning") || text.includes("career") || text.includes("cert") || text.includes("budget")) return "Career";
  if (text.includes("zdr") || text.includes("security") || text.includes("privacy") || text.includes("retention") || text.includes("compliance")) return "Governance";
  return "General";
}

const CATEGORIES = ["All", "Technology", "Product", "Workplace", "Career", "Governance"];

export default function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  // New discussion modal / form state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Selected discussion view for thread deliberation
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const loadComments = (discussionId) => {
    if (!discussionId) return;
    setCommentsLoading(true);
    const req = listDiscussionComments(discussionId);
    if (!req || typeof req.then !== "function") {
      setCommentsLoading(false);
      return;
    }
    req
      .then(({ data }) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  };

  const openThread = (disc) => {
    setSelectedDiscussion(disc);
    setReplyingTo(null);
    setNewComment("");
    if (disc?.id) {
      loadComments(disc.id);
    }
  };

  const loadAll = () => {
    setLoading(true);
    setError("");
    listDiscussions()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setDiscussions(list);
        if (list.length > 0 && typeof import.meta !== "undefined" && import.meta.env?.MODE !== "test") {
          setSelectedDiscussion((curr) => {
            const found = curr ? list.find((d) => d.id === curr.id) : null;
            const topDisc = found || list[0];
            openThread(topDisc);
            return topDisc;
          });
        }
      })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load discussions")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreateSubmitting(true);
    setCreateError("");
    try {
      const { data } = await createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      setDiscussions([data, ...discussions]);
      setNewTitle("");
      setNewContent("");
      setIsCreating(false);
      openThread(data);
    } catch (err) {
      setCreateError(extractErrorMessage(err, "Failed to create discussion"));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this discussion thread?")) return;
    try {
      await deleteDiscussion(id);
      setDiscussions(discussions.filter((d) => d.id !== id));
      if (selectedDiscussion?.id === id) {
        setSelectedDiscussion(null);
      }
    } catch (err) {
      alert(extractErrorMessage(err, "Could not delete discussion"));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedDiscussion) return;
    setCommentSubmitting(true);
    try {
      const { data } = await createDiscussionComment(selectedDiscussion.id, {
        content: newComment.trim(),
        parentCommentId: replyingTo?.id || undefined,
      });
      setComments([...comments, data]);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      alert(extractErrorMessage(err, "Could not post comment"));
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteDiscussionComment(selectedDiscussion.id, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not delete comment"));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return discussions.filter((d) => {
      const isMine = d.author?.email === user?.email;
      if (tab === "mine" && !isMine) return false;
      const dCat = getTopicCategory(d.title, d.content);
      if (category !== "All" && dCat !== category) return false;
      if (!q) return true;
      const authorName = d.author?.name || d.author?.fullName || "";
      const matchTitle = d.title?.toLowerCase().includes(q);
      const matchAuthor = authorName.toLowerCase().includes(q);
      const matchContent = d.content?.toLowerCase().includes(q);
      const matchCat = dCat.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchContent || matchCat;
    });
  }, [discussions, tab, category, query, user]);

  return (
    <div className="discussions-page">
      <TopBar
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Discussions" },
        ]}
        eyebrow="Collaborative Deliberation"
        title="Discussions"
        subtitle="Open-ended discussions, topic framing, and proposal drafting before formal voting."
        action={
          <button
            type="button"
            className="btn brass"
            onClick={() => setIsCreating(true)}
          >
            + Start Discussion
          </button>
        }
      />

      {/* New Discussion Modal / Drawer */}
      {isCreating && (
        <div className="modal-backdrop" onClick={() => setIsCreating(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Start a New Discussion</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsCreating(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              {createError && <div className="error-banner">{createError}</div>}
              <div>
                <label htmlFor="disc-title">Topic Title</label>
                <input
                  id="disc-title"
                  className="input"
                  required
                  placeholder="e.g. Should we adopt remote-first hiring in Q3?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="disc-content">Framing & Context</label>
                <textarea
                  id="disc-content"
                  className="input"
                  rows={5}
                  required
                  placeholder="Explain the background, why this topic matters, and key questions to consider..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="btn brass"
                >
                  {createSubmitting ? "Publishing…" : "Publish Discussion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Discussions Workspace: Split View */}
      <div className="discussions-layout">
        {/* Left Column: Thread List */}
        <div className="threads-list-panel">
          <div className="threads-controls">
            <div className="board-tabs" role="tablist">
              <button
                className={tab === "all" ? "active" : ""}
                onClick={() => setTab("all")}
                role="tab"
              >
                All Threads ({discussions.length})
              </button>
              <button
                className={tab === "mine" ? "active" : ""}
                onClick={() => setTab("mine")}
                role="tab"
              >
                My Threads
              </button>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "3px 10px",
                    fontSize: "11px",
                    borderRadius: "12px",
                    border: category === cat ? "1px solid var(--teal)" : "1px solid var(--line)",
                    background: category === cat ? "var(--teal)" : "var(--paper)",
                    color: category === cat ? "#fff" : "var(--ink-soft)",
                    cursor: "pointer",
                    fontWeight: category === cat ? 600 : 500,
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="board-search-wrap" style={{ marginTop: 12 }}>
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search discussions by topic or author…"
                aria-label="Search discussions"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="state-block">Loading discussions…</div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="state-block">
              <h3>No discussions found</h3>
              <p>Be the first to open a deliberation topic for your team.</p>
              <button
                type="button"
                className="btn brass"
                style={{ marginTop: 12 }}
                onClick={() => setIsCreating(true)}
              >
                + Start Discussion
              </button>
            </div>
          ) : (
            <div className="thread-cards">
              {filtered.map((disc) => {
                const isSelected = selectedDiscussion?.id === disc.id;
                const authorName = disc.author?.name || disc.author?.fullName || "Team Member";
                const topicCat = getTopicCategory(disc.title, disc.content);
                return (
                  <div
                    key={disc.id}
                    className={`thread-row-card ${isSelected ? "selected" : ""}`}
                    onClick={() => openThread(disc)}
                  >
                    <div className="thread-avatar" style={{ overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", zIndex: 0 }}>{getInitials(authorName)}</span>
                      <img
                        src={disc.author?.avatarUrl || getAvatarUrl(authorName)}
                        alt={authorName}
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", position: "relative", zIndex: 1 }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                    <div className="thread-info">
                      <div className="thread-title-row">
                        <h4>{disc.title}</h4>
                        {user?.email === disc.author?.email && (
                          <button
                            type="button"
                            className="disc-delete-btn"
                            title="Delete discussion"
                            onClick={(e) => handleDeleteDiscussion(disc.id, e)}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                      <p className="thread-snippet">
                        {disc.content.length > 90
                          ? `${disc.content.slice(0, 88)}…`
                          : disc.content}
                      </p>
                      <div className="thread-meta">
                        <span className="topic-tag">{topicCat}</span>
                        <span>·</span>
                        <span>{authorName}</span>
                        <span>·</span>
                        <time>{timeAgo(disc.createdAt) || "Recently"}</time>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Thread Deliberation View */}
        <div className="thread-detail-panel">
          {selectedDiscussion ? (
            <div className="active-thread-container">
              {/* Thread Header */}
              <div className="thread-header-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span className="eyebrow" style={{ margin: 0 }}>Deliberation Topic</span>
                      <span className="topic-tag" style={{ fontSize: "11px", padding: "2px 8px" }}>
                        {getTopicCategory(selectedDiscussion.title, selectedDiscussion.content)}
                      </span>
                    </div>
                    <h2>{selectedDiscussion.title}</h2>
                  </div>
                  <Link
                    to={`/boards/new?title=${encodeURIComponent(selectedDiscussion.title)}`}
                    className="btn brass"
                    title="Scale this discussion into a formal voting board"
                  >
                    Scale to Decision Board →
                  </Link>
                </div>

                <div className="author-bar">
                  {(() => {
                    const activeAuthorName = selectedDiscussion.author?.name || selectedDiscussion.author?.fullName || "Workspace Member";
                    return (
                      <>
                        <div className="avatar" style={{ overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ position: "absolute", zIndex: 0 }}>{getInitials(activeAuthorName)}</span>
                          <img
                            src={selectedDiscussion.author?.avatarUrl || getAvatarUrl(activeAuthorName)}
                            alt={activeAuthorName}
                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", position: "relative", zIndex: 1 }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong>{activeAuthorName}</strong>
                            {selectedDiscussion.author?.role && (
                              <span className={`sidebar-role-badge role-${selectedDiscussion.author.role.toLowerCase()}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
                                {selectedDiscussion.author.role === "ADMIN" ? "Admin" : selectedDiscussion.author.role === "MODERATOR" ? "Mod" : "Author"}
                              </span>
                            )}
                          </div>
                          <div className="sub-time">
                            Posted {timeAgo(selectedDiscussion.createdAt) || "recently"} · Deliberation Stage
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="thread-content-body">
                  {selectedDiscussion.content}
                </div>
              </div>

              {/* Comments / Deliberation Stream */}
              <div className="comments-stream-section">
                <h3>Comments & Perspectives ({comments.length})</h3>

                {commentsLoading ? (
                  <div className="state-block">Loading comments…</div>
                ) : comments.length === 0 ? (
                  <div className="empty-comments-note">
                    No comments yet. Share your thoughts or propose next steps below!
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.map((c) => {
                      const cAuthor = c.author?.name || c.author?.fullName || "Member";
                      return (
                        <div key={c.id} className="comment-bubble-card">
                          <div className="comment-header">
                            <span className="mini-avatar" style={{ overflow: "hidden", position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ position: "absolute", zIndex: 0 }}>{getInitials(cAuthor)}</span>
                              <img
                                src={c.author?.avatarUrl || getAvatarUrl(cAuthor)}
                                alt={cAuthor}
                                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", position: "relative", zIndex: 1 }}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            </span>
                            <strong>{cAuthor}</strong>
                            <time className="comment-time">
                              {timeAgo(c.createdAt) || "just now"}
                            </time>
                            {user?.email === c.author?.email && (
                              <button
                                type="button"
                                className="comment-del-btn"
                                onClick={() => handleDeleteComment(c.id)}
                                title="Delete comment"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <div className="comment-text">{c.content}</div>
                          <div className="comment-footer">
                            <button
                              type="button"
                              className="reply-action-btn"
                              onClick={() => {
                                setReplyingTo(c);
                                document.getElementById("disc-comment-input")?.focus();
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comment Composer */}
                <form onSubmit={handleAddComment} className="comment-composer-box">
                  {replyingTo && (
                    <div className="replying-banner">
                      <span>Replying to <strong>{replyingTo.author?.name || replyingTo.author?.fullName || "comment"}</strong></span>
                      <button type="button" onClick={() => setReplyingTo(null)}>✕</button>
                    </div>
                  )}
                  <textarea
                    id="disc-comment-input"
                    className="input"
                    rows={3}
                    placeholder={replyingTo ? "Write your reply…" : "Add your thoughts or suggestions…"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      className="btn brass"
                    >
                      {commentSubmitting ? "Posting…" : replyingTo ? "Post Reply" : "Add Perspective"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="state-block" style={{ padding: "80px 32px", textAlign: "center" }}>
              <h3>Select a discussion</h3>
              <p>Choose an ongoing deliberation topic from the list to view context, perspectives, and replies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
