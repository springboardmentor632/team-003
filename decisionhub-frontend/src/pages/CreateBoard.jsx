import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { createDecision } from "../api/decisions";
import { uploadFile, resolveFileUrl } from "../api/files";
import { extractErrorMessage } from "../api/client";

const CATEGORIES = ["Career", "Technology", "Travel", "Finance", "Lifestyle", "Education"];

function emptyOption() {
  return { title: "", description: "", imageUrl: "", costScore: "", benefitsScore: "", riskScore: "", timeScore: "", convenienceScore: "", pros: "", cons: "" };
}

export default function CreateBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get("communityId");
  const communityName = searchParams.get("communityName");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Career");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [pollType, setPollType] = useState("SINGLE_CHOICE");
  const [allowAnonymousVoting, setAllowAnonymousVoting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingOptionIdx, setUploadingOptionIdx] = useState(null);
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateOption = (index, field, value) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const addOption = () => setOptions((prev) => [...prev, emptyOption()]);
  const removeOption = (index) => setOptions((prev) => prev.filter((_, i) => i !== index));

  const handleCoverUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingCover(true);
      setError("");
      try {
        const { data } = await uploadFile({ file });
        setImageUrl(data.fileUrl);
      } catch (err) {
        setError(extractErrorMessage(err, "Failed to upload cover image"));
      } finally {
        setUploadingCover(false);
      }
    }
  };

  const handleOptionUpload = async (index, file) => {
    setUploadingOptionIdx(index);
    setError("");
    try {
      const { data } = await uploadFile({ file });
      updateOption(index, "imageUrl", data.fileUrl);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to upload option image"));
    } finally {
      setUploadingOptionIdx(null);
    }
  };

  const toIntOrUndefined = (v) => (v === "" || v === null ? undefined : parseInt(v, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (options.length < 2) {
      setError("At least 2 options are required to compare");
      return;
    }
    if (options.some((o) => !o.title.trim())) {
      setError("Every option needs a title");
      return;
    }

    const payload = {
      title,
      description,
      category,
      visibility,
      pollType,
      allowAnonymousVoting,
      imageUrl: imageUrl.trim() || undefined,
      communityId: communityId ? Number(communityId) : undefined,
      options: options.map((o) => ({
        title: o.title,
        description: o.description || undefined,
        imageUrl: o.imageUrl?.trim() || undefined,
        costScore: toIntOrUndefined(o.costScore),
        benefitsScore: toIntOrUndefined(o.benefitsScore),
        riskScore: toIntOrUndefined(o.riskScore),
        timeScore: toIntOrUndefined(o.timeScore),
        convenienceScore: toIntOrUndefined(o.convenienceScore),
        pros: o.pros || undefined,
        cons: o.cons || undefined,
      })),
    };

    setSubmitting(true);
    try {
      const { data } = await createDecision(payload);
      navigate(`/boards/${data.id}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create this decision board"));
      setSubmitting(false);
    }
  };

  return (
    <div>
      <TopBar eyebrow={communityName ? "Community board" : "New board"} title="Create a decision board" subtitle={communityName ? `Create a shared decision for ${communityName}. Every member can view and vote.` : "Frame your choice, add at least two options, and open it up for votes."} />

      {error && <div className="error-banner">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. MBA vs. Staying in my Job" />
        </div>

        <div className="field">
          <label>Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A sentence of context for voters" />
        </div>

        <div className="field">
          <label>Cover image or diagram (optional)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg or upload below"
              style={{ flex: 1 }}
            />
            <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap", margin: 0, padding: "10px 14px", fontSize: 12 }}>
              {uploadingCover ? "Uploading…" : "📁 Upload image"}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
                style={{ display: "none" }}
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                className="remove-link"
                onClick={() => setImageUrl("")}
                style={{ fontSize: 12 }}
              >
                Clear
              </button>
            )}
          </div>
          {imageUrl && (
            <div style={{ marginTop: 10, borderRadius: "var(--radius)", overflow: "hidden", maxHeight: 160, maxWidth: 320, border: "1px solid var(--line)" }}>
              <img
                src={resolveFileUrl(imageUrl)}
                alt="Cover preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="PUBLIC">Public — anyone can view</option>
              <option value="PRIVATE">Private — only you and admins</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Poll type</label>
            <select value={pollType} onChange={(e) => setPollType(e.target.value)}>
              <option value="SINGLE_CHOICE">Single choice — one vote per person</option>
              <option value="MULTIPLE_CHOICE">Multiple choice — vote for several</option>
              <option value="RATING">Rating — score each option 1–5</option>
            </select>
          </div>
          <div className="field">
            <label>Anonymous voting</label>
            <select value={allowAnonymousVoting ? "yes" : "no"} onChange={(e) => setAllowAnonymousVoting(e.target.value === "yes")}>
              <option value="no">Not allowed</option>
              <option value="yes">Allowed</option>
            </select>
          </div>
        </div>

        <div style={{ margin: "22px 0 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-soft)", fontWeight: 600 }}>
          Options to compare
        </div>

        {options.map((opt, i) => (
          <div className="option-block" key={i}>
            <div className="opt-title-row">
              <span>Option {i + 1}</span>
              {options.length > 2 && (
                <button type="button" className="remove-link" onClick={() => removeOption(i)}>Remove</button>
              )}
            </div>

            <div className="field">
              <label>Title</label>
              <input required value={opt.title} onChange={(e) => updateOption(i, "title", e.target.value)} placeholder="e.g. MBA" />
            </div>

            <div className="field">
              <label>Option image / diagram (optional)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={opt.imageUrl || ""}
                  onChange={(e) => updateOption(i, "imageUrl", e.target.value)}
                  placeholder="https://example.com/option.jpg or upload"
                  style={{ flex: 1 }}
                />
                <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap", margin: 0, padding: "8px 12px", fontSize: 11.5 }}>
                  {uploadingOptionIdx === i ? "Uploading…" : "📁 Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleOptionUpload(i, e.target.files[0])}
                    disabled={uploadingOptionIdx === i}
                    style={{ display: "none" }}
                  />
                </label>
                {opt.imageUrl && (
                  <button
                    type="button"
                    className="remove-link"
                    onClick={() => updateOption(i, "imageUrl", "")}
                    style={{ fontSize: 11.5 }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {opt.imageUrl && (
                <div style={{ marginTop: 8, borderRadius: "var(--radius)", overflow: "hidden", maxHeight: 120, maxWidth: 240, border: "1px solid var(--line)" }}>
                  <img
                    src={resolveFileUrl(opt.imageUrl)}
                    alt="Option preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="field"><label>Pros</label><input value={opt.pros} onChange={(e) => updateOption(i, "pros", e.target.value)} placeholder="Higher long-term earning potential" /></div>
              <div className="field"><label>Cons</label><input value={opt.cons} onChange={(e) => updateOption(i, "cons", e.target.value)} placeholder="Expensive, 2 years unpaid" /></div>
            </div>

            <div className="form-row">
              <div className="field"><label>Cost (1–10)</label><input type="number" min="1" max="10" value={opt.costScore} onChange={(e) => updateOption(i, "costScore", e.target.value)} /></div>
              <div className="field"><label>Benefits (1–10)</label><input type="number" min="1" max="10" value={opt.benefitsScore} onChange={(e) => updateOption(i, "benefitsScore", e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Risk (1–10)</label><input type="number" min="1" max="10" value={opt.riskScore} onChange={(e) => updateOption(i, "riskScore", e.target.value)} /></div>
              <div className="field"><label>Time (1–10)</label><input type="number" min="1" max="10" value={opt.timeScore} onChange={(e) => updateOption(i, "timeScore", e.target.value)} /></div>
            </div>
            <div className="field"><label>Convenience (1–10)</label><input type="number" min="1" max="10" value={opt.convenienceScore} onChange={(e) => updateOption(i, "convenienceScore", e.target.value)} /></div>
          </div>
        ))}

        <button type="button" className="add-option-btn" onClick={addOption}>+ Add another option</button>

        <button type="submit" className="btn brass full" disabled={submitting}>
          {submitting ? "Creating…" : "Create decision board"}
        </button>
      </form>
    </div>
  );
}
