import React, { useState } from "react";

const initialComments = [
  {
    id: 1,
    name: "Harish",
    initials: "H",
    text: "I think we should consider the long-term benefits before deciding.",
    time: "12 min ago",
  },
  {
    id: 2,
    name: "Sherya",
    initials: "S",
    text: "Agreed. The cost is important, but convenience also matters here.",
    time: "8 min ago",
  },
];

export default function CommentSection() {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");

  const addComment = () => {
    const value = text.trim();

    if (!value) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "You",
        initials: "Y",
        text: value,
        time: "Just now",
      },
    ]);

    setText("");
  };

  return (
    <section className="discussion" id="discussion">
      <div className="discussion-head">
        <div>
          <div className="eyebrow">Community discussion</div>
          <h2 className="display">What do you think?</h2>
        </div>

        <span className="discussion-live">Discussion</span>
      </div>

      <div className="comment-composer">
        <div className="avatar">Y</div>

        <div style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows="3"
          />

          <div className="composer-actions">
            <span>Be respectful and constructive.</span>

            <button
              className="btn teal"
              type="button"
              onClick={addComment}
              disabled={!text.trim()}
            >
              Add comment
            </button>
          </div>
        </div>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="empty-note">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <div className="avatar">{comment.initials}</div>

              <div className="comment-content">
                <div className="comment-top">
                  <strong>{comment.name}</strong>
                  <span>{comment.time}</span>
                </div>

                <p>{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}