import React, { useState } from "react";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = (event) => {
    event.preventDefault();

    if (!rating || !message.trim()) return;

    setSubmitted(true);
    setMessage("");
  };

  if (submitted) {
    return (
      <div className="panel">
        <h3>Feedback submitted</h3>
        <p className="sub">
          Thanks for helping improve DecisionHub.
        </p>

        <button
          className="btn teal"
          style={{ marginTop: 16 }}
          onClick={() => {
            setSubmitted(false);
            setRating(0);
          }}
        >
          Give more feedback
        </button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submitFeedback}>
      <div className="field">
        <label>How was your experience?</label>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              className="btn ghost"
              onClick={() => setRating(number)}
              style={{
                background:
                  rating >= number ? "var(--teal-dim)" : undefined,
                borderColor:
                  rating >= number ? "var(--teal)" : undefined,
                color:
                  rating >= number ? "var(--teal)" : undefined,
              }}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Tell us more</label>

        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your feedback..."
          style={{
            width: "100%",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: "12px",
            background: "var(--paper-raised)",
            color: "var(--ink)",
            resize: "vertical",
            fontFamily: "Inter",
          }}
        />
      </div>

      <button className="btn teal" type="submit">
        Submit
      </button>
    </form>
  );
}