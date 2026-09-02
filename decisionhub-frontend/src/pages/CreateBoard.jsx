import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { createDecision } from "../api/decisions";
import { extractErrorMessage } from "../api/client";

const CATEGORIES = ["Career", "Technology", "Travel", "Finance", "Lifestyle", "Education"];

function emptyOption() {
  return { title: "", description: "", costScore: "", benefitsScore: "", riskScore: "", timeScore: "", convenienceScore: "", pros: "", cons: "" };
}

export default function CreateBoard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Career");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [pollType, setPollType] = useState("SINGLE_CHOICE");
  const [allowAnonymousVoting, setAllowAnonymousVoting] = useState(false);
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateOption = (index, field, value) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const addOption = () => setOptions((prev) => [...prev, emptyOption()]);
  const removeOption = (index) => setOptions((prev) => prev.filter((_, i) => i !== index));

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
      options: options.map((o) => ({
        title: o.title,
        description: o.description || undefined,
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
      <TopBar eyebrow="New board" title="Create a decision board" subtitle="Frame your choice, add at least two options, and open it up for votes." />

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
