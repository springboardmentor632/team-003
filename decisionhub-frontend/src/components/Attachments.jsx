import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDecisionAttachments, uploadFile, deleteAttachment, resolveFileUrl } from "../api/files";
import { extractErrorMessage } from "../api/client";
import { timeAgo } from "../utils/decisionHelpers";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(contentType, fileName = "") {
  if (contentType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName)) return "🖼️";
  if (contentType?.includes("pdf") || /\.pdf$/i.test(fileName)) return "📄";
  if (contentType?.includes("sheet") || contentType?.includes("excel") || /\.(xlsx?|csv)$/i.test(fileName)) return "📊";
  if (contentType?.includes("word") || /\.(docx?|odt)$/i.test(fileName)) return "📝";
  if (contentType?.includes("zip") || contentType?.includes("compressed") || /\.(zip|tar|gz)$/i.test(fileName)) return "📦";
  return "📎";
}

export default function Attachments({ boardId, options = [], canManage = false }) {
  const { user, isAuthenticated } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");

  const loadAttachments = () => {
    if (!boardId) return;
    setLoading(true);
    getDecisionAttachments(boardId)
      .then(({ data }) => setAttachments(data || []))
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load attachments")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        file: selectedFile,
        decisionId: boardId,
        optionId: selectedOptionId ? Number(selectedOptionId) : undefined,
      };
      const { data } = await uploadFile(payload);
      setAttachments((prev) => [data, ...prev]);
      setSuccess(`File "${data.fileName}" uploaded successfully!`);
      setSelectedFile(null);
      // Reset the file input field
      const fileInput = document.getElementById("attachment-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to upload attachment"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    try {
      await deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      setSuccess("Attachment deleted successfully");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't delete attachment"));
    }
  };

  return (
    <section className="attachments-section panel" style={{ marginTop: 28 }} aria-label="Attachments & Evidence">
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <h2>Attachments & Evidence</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 4 }}>
            Supporting documents, research papers, comparison spreadsheets, and media files for this decision.
          </p>
        </div>
        <span className="tag mono">{attachments.length} {attachments.length === 1 ? "file" : "files"}</span>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="success-banner" style={{ marginBottom: 16, background: "var(--teal-dim)", color: "var(--teal)", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 13 }}>{success}</div>}

      {/* Upload Box */}
      {isAuthenticated ? (
        <form className="attachment-upload-box" onSubmit={handleUpload} style={{ background: "var(--paper)", border: "1px dashed var(--line)", padding: 18, borderRadius: "var(--radius)", marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "var(--ink)" }}>
            Upload Supporting Attachment
          </div>
          <div className="form-row" style={{ alignItems: "center", gap: 12 }}>
            <div className="field" style={{ marginBottom: 0, flex: 2 }}>
              <input
                id="attachment-file-input"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ padding: "8px 10px", fontSize: 12 }}
              />
            </div>
            {options.length > 0 && (
              <div className="field" style={{ marginBottom: 0, flex: 1.5 }}>
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  disabled={uploading}
                  style={{ padding: "8px 10px", fontSize: 12 }}
                >
                  <option value="">Attach to: Entire Board</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      Attach to: {opt.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="btn brass"
              disabled={uploading || !selectedFile}
              style={{ padding: "9px 18px", whiteSpace: "nowrap" }}
            >
              {uploading ? "Uploading…" : "Upload File"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 8 }}>
            Max file size: 25 MB. Supported formats: PDF, PNG, JPG, WebP, Word, Excel, CSV, ZIP.
          </div>
        </form>
      ) : (
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", padding: "12px 14px", background: "var(--paper)", borderRadius: "var(--radius)", marginBottom: 16 }}>
          Sign in to attach documents, photos, or research files to this board.
        </div>
      )}

      {/* Attachment List */}
      {loading ? (
        <div className="state-block" style={{ padding: 24 }}>Loading attachments…</div>
      ) : attachments.length === 0 ? (
        <div className="empty-note" style={{ textAlign: "center", padding: 24 }}>
          No attachments uploaded yet. Supporting documents and images help members make informed votes.
        </div>
      ) : (
        <div className="attachment-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {attachments.map((att) => {
            const isImage = att.contentType?.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(att.fileName);
            const downloadUrl = resolveFileUrl(att.fileUrl);
            const isOwner = user?.id === att.uploadedByUserId || canManage || user?.role === "ADMIN";
            const targetOption = options.find((o) => o.id === att.optionId);

            return (
              <div
                key={att.id}
                className="attachment-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--paper-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>
                    {getFileIcon(att.contentType, att.fileName)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)", textDecoration: "none" }}
                        className="attachment-name"
                      >
                        {att.fileName}
                      </a>
                      {targetOption ? (
                        <span className="tag" style={{ fontSize: 10, padding: "2px 7px", background: "var(--teal-dim)", color: "var(--teal)" }}>
                          Option: {targetOption.title}
                        </span>
                      ) : (
                        <span className="tag" style={{ fontSize: 10, padding: "2px 7px" }}>
                          Board file
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>
                      <span>{formatBytes(att.fileSize)}</span>
                      <span> · </span>
                      <span>Uploaded {timeAgo(att.createdAt)}</span>
                      {att.uploadedByName && (
                        <>
                          <span> by </span>
                          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{att.uploadedByName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {isImage && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn ghost"
                      style={{ padding: "6px 12px", fontSize: 11.5 }}
                    >
                      Preview
                    </a>
                  )}
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.fileName}
                    className="btn ghost"
                    style={{ padding: "6px 12px", fontSize: 11.5 }}
                  >
                    Download
                  </a>
                  {isOwner && (
                    <button
                      type="button"
                      className="remove-link"
                      onClick={() => handleDelete(att.id, att.fileName)}
                      style={{ fontSize: 11.5, padding: "6px 8px" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
