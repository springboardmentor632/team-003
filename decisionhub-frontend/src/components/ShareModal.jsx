import React, { useState, useEffect } from "react";

/**
 * Robust copy helper with fallback for diverse browser environments
 */
async function copyText(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback to execCommand
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    return false;
  }
}

export default function ShareModal({ isOpen, onClose, board = {}, customUrl = null }) {
  const [activeTab, setActiveTab] = useState("link"); // "link" | "invite" | "chat" | "qr"
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [copiedQr, setCopiedQr] = useState(false);

  // Compute the definitive board link
  const origin = typeof window !== "undefined" ? window.location.origin : "https://decisionhub.org";
  const boardId = board.id || "";
  const shareUrl = customUrl || (boardId ? `${origin}/boards/${boardId}` : typeof window !== "undefined" ? window.location.href : "");

  // Close modal on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const ok = await copyText(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMarkdown = async () => {
    const md = `🗳️ **DecisionHub Deliberation:** [${board.title || "Decision Board"}](${shareUrl})\n${
      board.description ? `> ${board.description}\n` : ""
    }Cast your vote and review options here: ${shareUrl}`;
    const ok = await copyText(md);
    if (ok) {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2500);
    }
  };

  const handleCopyEmbed = async () => {
    const embedHtml = `<iframe src="${shareUrl}" width="100%" height="600" title="${board.title || "Decision Board"}" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`;
    const ok = await copyText(embedHtml);
    if (ok) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    }
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Compose a mailto URL
    const subject = encodeURIComponent(`[DecisionHub] Review & Vote: ${board.title || "Decision Board"}`);
    const noteText = inviteNote ? `\n\nNote from inviter:\n"${inviteNote}"` : "";
    const body = encodeURIComponent(
      `Hello,\n\nYou are invited to review and cast your vote on the following decision board on DecisionHub:\n\nTitle: ${
        board.title || "Decision Board"
      }\nDescription: ${board.description || "Deliberation in progress"}\nLink: ${shareUrl}${noteText}\n\nDeliberation is currently open.\n\nBest regards,\nDecisionHub Collaborative Platform`
    );

    // Open mailto
    const mailtoUrl = `mailto:${encodeURIComponent(inviteEmail)}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_blank");

    setInviteSuccess(`Invitation link prepared for ${inviteEmail}. Email client opened.`);
    setInviteEmail("");
    setInviteNote("");
    setTimeout(() => setInviteSuccess(""), 4000);
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: board.title || "DecisionHub Decision Board",
          text: board.description || "Review options and cast your vote on DecisionHub",
          url: shareUrl,
        });
      } catch (e) {
        // user cancelled or share failed
      }
    }
  };

  // QR Code URL using lightweight clean QR image generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&margin=8`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div
        className="modal-dialog"
        style={{ maxWidth: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 id="share-modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔗</span> Share Decision Board
            </h3>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
              {board.title || "Collaborative Deliberation"}
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close share dialog"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-raised)",
            padding: "0 16px",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            style={{
              padding: "10px 14px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "link" ? "2px solid var(--brass)" : "2px solid transparent",
              color: activeTab === "link" ? "var(--brass)" : "var(--ink-soft)",
              fontWeight: activeTab === "link" ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            🔗 Direct Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invite")}
            style={{
              padding: "10px 14px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "invite" ? "2px solid var(--brass)" : "2px solid transparent",
              color: activeTab === "invite" ? "var(--brass)" : "var(--ink-soft)",
              fontWeight: activeTab === "invite" ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ✉️ Email Invite
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            style={{
              padding: "10px 14px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "chat" ? "2px solid var(--brass)" : "2px solid transparent",
              color: activeTab === "chat" ? "var(--brass)" : "var(--ink-soft)",
              fontWeight: activeTab === "chat" ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            💬 Slack & Embed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            style={{
              padding: "10px 14px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "qr" ? "2px solid var(--brass)" : "2px solid transparent",
              color: activeTab === "qr" ? "var(--brass)" : "var(--ink-soft)",
              fontWeight: activeTab === "qr" ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            📱 QR Code
          </button>
        </div>

        {/* Tab 1: Direct Link */}
        {activeTab === "link" && (
          <div style={{ padding: "20px" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: "var(--ink)" }}>
              Board Sharing Link
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => e.target.select()}
                style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: 13,
                  padding: "9px 12px",
                  background: "var(--paper-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  color: "var(--ink)",
                }}
              />
              <button
                type="button"
                className={`btn ${copiedLink ? "brass" : "ghost"}`}
                onClick={handleCopyLink}
                style={{
                  minWidth: 110,
                  transition: "all 0.2s ease",
                  backgroundColor: copiedLink ? "#059669" : undefined,
                  borderColor: copiedLink ? "#059669" : undefined,
                  color: copiedLink ? "#ffffff" : undefined,
                }}
              >
                {copiedLink ? "✓ Copied!" : "Copy link"}
              </button>
            </div>

            {/* Board Status & Privacy pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "var(--paper-raised)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{board.visibility === "PUBLIC" ? "🌐" : "🔒"}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                    {board.visibility === "PUBLIC" ? "Public Deliberation" : "Private Community Board"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {board.visibility === "PUBLIC"
                      ? "Anyone with the link can view and participate in voting."
                      : "Only authenticated members of the community can cast votes."}
                  </div>
                </div>
              </div>
              <span
                className="tag"
                style={{
                  background: board.closed ? "rgba(100, 116, 139, 0.12)" : "rgba(0, 137, 123, 0.12)",
                  color: board.closed ? "var(--ink-soft)" : "var(--brass)",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {board.closed ? "Closed" : "Voting Open"}
              </span>
            </div>

            {/* Native Mobile Share if supported */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                type="button"
                className="btn ghost"
                onClick={handleNativeShare}
                style={{ width: "100%", justifyContent: "center", display: "flex", gap: 8 }}
              >
                <span>📱</span> Share via Device Apps (AirDrop, Messages, WhatsApp)
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Email Invite */}
        {activeTab === "invite" && (
          <form onSubmit={handleSendInvite} style={{ padding: "20px" }}>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px 0" }}>
              Invite a colleague, stakeholder, or community member directly to this deliberation.
            </p>

            {inviteSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(5, 150, 105, 0.1)",
                  border: "1px solid rgba(5, 150, 105, 0.3)",
                  borderRadius: "var(--radius)",
                  color: "#059669",
                  fontSize: 12.5,
                  fontWeight: 500,
                  marginBottom: 14,
                }}
              >
                ✓ {inviteSuccess}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@organization.org"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "var(--paper-raised)",
                  color: "var(--ink)",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                Optional Personal Note
              </label>
              <textarea
                rows={3}
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Hi team, please review these architecture proposals and cast your vote before Thursday."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "var(--paper-raised)",
                  color: "var(--ink)",
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn brass">
                ✉️ Open in Mail Client
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Slack, Teams & Embed Code */}
        {activeTab === "chat" && (
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
                  Slack, Discord & Microsoft Teams (Markdown)
                </label>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleCopyMarkdown}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    color: copiedMarkdown ? "#059669" : undefined,
                    fontWeight: 600,
                  }}
                >
                  {copiedMarkdown ? "✓ Markdown Copied!" : "Copy snippet"}
                </button>
              </div>
              <pre
                style={{
                  padding: "10px 12px",
                  background: "var(--paper-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  margin: 0,
                }}
              >
                {`🗳️ **DecisionHub Deliberation:** [${board.title || "Decision Board"}](${shareUrl})
Cast your vote here: ${shareUrl}`}
              </pre>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
                  Embed HTML (Wiki, Confluence, Notion)
                </label>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleCopyEmbed}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    color: copiedEmbed ? "#059669" : undefined,
                    fontWeight: 600,
                  }}
                >
                  {copiedEmbed ? "✓ Embed Code Copied!" : "Copy iframe"}
                </button>
              </div>
              <pre
                style={{
                  padding: "10px 12px",
                  background: "var(--paper-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  fontSize: 11.5,
                  color: "var(--ink-soft)",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  margin: 0,
                }}
              >
                {`<iframe src="${shareUrl}" width="100%" height="600" title="${
                  board.title || "Decision Board"
                }" frameborder="0"></iframe>`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: QR Code for Meetings */}
        {activeTab === "qr" && (
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 16px 0" }}>
              Scan with a smartphone camera during live team meetings or presentations to vote instantly.
            </p>
            <div
              style={{
                display: "inline-block",
                padding: 12,
                background: "#ffffff",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                marginBottom: 16,
              }}
            >
              <img
                src={qrCodeUrl}
                alt={`QR code to vote on ${board.title || "board"}`}
                width={160}
                height={160}
                style={{ display: "block" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button
                type="button"
                className="btn brass"
                onClick={handleCopyLink}
              >
                {copiedLink ? "✓ Link Copied!" : "Copy Link"}
              </button>
              <a
                href={qrCodeUrl}
                target="_blank"
                rel="noreferrer"
                download={`decisionhub-qr-${board.id || "board"}.png`}
                className="btn ghost"
              >
                Download QR Code
              </a>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--paper-raised)",
          }}
        >
          <button type="button" className="btn ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
