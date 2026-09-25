import React, { useState } from "react";

export default function ReportModal({ onClose }) {
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReport = (event) => {
    event.preventDefault();

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="modal-backdrop">
        <div className="form-card" style={{ maxWidth: 480 }}>
          <h2 className="display">Report submitted</h2>

          <p className="sub">
            Thank you. The report will be reviewed by a moderator.
          </p>

          <button
            className="btn teal"
            style={{ marginTop: 20 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="form-card" style={{ maxWidth: 480 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <h2 className="display">Report content</h2>

          <button className="btn ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={submitReport}>
          <div className="field">
            <label>Reason</label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option>Inappropriate content</option>
              <option>Spam</option>
              <option>Harassment</option>
              <option>Misleading information</option>
              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label>Additional details</label>

            <textarea
              rows="5"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain the issue..."
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

          <div className="detail-actions">
            <button className="btn brass" type="submit">
              Submit report
            </button>

            <button className="btn ghost" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}