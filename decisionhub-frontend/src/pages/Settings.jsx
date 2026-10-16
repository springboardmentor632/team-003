import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getProfile, updateProfile, changePassword, updateUserInterests } from "../api/user";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getInitials, getAvatarUrl, CURATED_AVATARS } from "../utils/decisionHelpers";

const AVAILABLE_CATEGORIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Career",
  "Travel",
  "Lifestyle",
  "Product",
  "Community",
  "General",
];

const CATEGORY_ICONS = {
  Technology: "💻",
  Finance: "💰",
  Healthcare: "🩺",
  Education: "🎓",
  Career: "🚀",
  Travel: "✈️",
  Lifestyle: "🌿",
  Product: "📦",
  Community: "👥",
  General: "🌐",
};

import { useTheme } from "../context/ThemeContext";

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function Settings() {
  const { user, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile Form State
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Interests State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestsSaving, setInterestsSaving] = useState(false);
  const [interestsSuccess, setInterestsSuccess] = useState("");
  const [interestsError, setInterestsError] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;
    getProfile()
      .then(({ data }) => {
        if (!active) return;
        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
        setSelectedInterests(Array.from(data.interests || []));
      })
      .catch((err) => {
        if (active) setProfileError(extractErrorMessage(err, "Failed to load profile"));
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const { data } = await updateProfile({
        name,
        bio,
        avatarUrl,
        interests: selectedInterests,
      });
      setProfileSuccess("Profile updated successfully!");
      if (updateUserProfile) {
        updateUserProfile({
          fullName: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        });
      }
    } catch (err) {
      setProfileError(extractErrorMessage(err, "Failed to update profile"));
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleInterest = (category) => {
    setSelectedInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSelectAllInterests = () => {
    setSelectedInterests([...AVAILABLE_CATEGORIES]);
  };

  const handleClearInterests = () => {
    setSelectedInterests([]);
  };

  const handleSaveInterests = async () => {
    setInterestsSaving(true);
    setInterestsSuccess("");
    setInterestsError("");

    try {
      const { data } = await updateUserInterests(selectedInterests);
      setSelectedInterests(Array.from(data || []));
      setInterestsSuccess("Category interests saved successfully!");
    } catch (err) {
      setInterestsError(extractErrorMessage(err, "Failed to update interests"));
    } finally {
      setInterestsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordSaving(false);
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(extractErrorMessage(err, "Failed to change password"));
    } finally {
      setPasswordSaving(false);
    }
  };

  const userDisplayName = name || user?.fullName || "Decision Maker";
  const userInitials = getInitials(userDisplayName);

  return (
    <div>
      <TopBar
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: "Settings & Profile" },
        ]}
        eyebrow="Account & Preferences"
        title="Settings & Profile"
        subtitle="Manage your interface appearance, personal profile, topic interests, and credentials."
      />

      <div className="settings-full-layout">
        {/* Sticky Minimalist Sub-Nav Sidebar */}
        <aside className="settings-nav-sidebar">
          <div className="settings-user-brief">
            <div className="settings-user-brief-avatar" style={{ overflow: "hidden", position: "relative" }}>
              {avatarUrl || getAvatarUrl(userDisplayName) ? (
                <img
                  src={avatarUrl || getAvatarUrl(userDisplayName)}
                  alt={userDisplayName}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : null}
              <span style={{ position: "absolute" }}>{userInitials}</span>
            </div>
            <div className="settings-user-brief-info">
              <strong>{userDisplayName}</strong>
              <span>{email || user?.email || "Member"}</span>
            </div>
          </div>

          <nav className="settings-sub-nav" aria-label="Settings navigation">
            <a href="#appearance" className="settings-nav-item">
              <IconPalette />
              <span>Appearance</span>
            </a>
            <a href="#profile" className="settings-nav-item">
              <IconUser />
              <span>Identity & Bio</span>
            </a>
            <a href="#interests" className="settings-nav-item">
              <IconTarget />
              <span>Topic Feed</span>
            </a>
            <a href="#security" className="settings-nav-item">
              <IconShield />
              <span>Credentials</span>
            </a>
          </nav>

          <div className="settings-nav-footer-card">
            <div className="settings-status-pill">
              <span className="status-dot-pulse" />
              <span>Active Account</span>
            </div>
            <p>End-to-end encrypted session with verified credentials.</p>
          </div>
        </aside>

        {/* Full-Scale Settings Content Area */}
        <div className="settings-main-content">
          {/* Appearance & Theme (Light / Dark Mode) */}
          <div className="settings-card settings-section-anchor" id="appearance">
          <div className="settings-card-head">
            <div className="settings-card-head-left">
              <div className="settings-card-icon" style={{ background: "rgba(185, 134, 47, 0.12)", color: "var(--brass)" }}>
                <SunIcon />
              </div>
              <div>
                <h2>Appearance & Theme</h2>
                <p>Customize how DecisionHub looks on your device. Choose between light and dark themes.</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", background: "var(--teal-dim)", padding: "4px 12px", borderRadius: 12 }}>
              {theme === "dark" ? "🌙 Dark Theme Active" : theme === "light" ? "☀️ Light Theme Active" : "🖥️ System Theme Active"}
            </span>
          </div>

          <div className="settings-card-body">
            <div className="theme-switcher-grid">
              {/* Light Mode Option */}
              <button
                type="button"
                className={`theme-card-button ${theme === "light" ? "selected" : ""}`}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                <div className="theme-preview-box light">
                  <div className="preview-top" />
                  <div className="preview-split">
                    <div className="preview-side" />
                    <div className="preview-main">
                      <div className="preview-line-title" />
                      <div className="preview-box-card" />
                    </div>
                  </div>
                </div>
                <div className="theme-info-content">
                  <div className="theme-label-row">
                    <span className="theme-title"><SunIcon /> Light Mode</span>
                    {theme === "light" && <span className="theme-active-indicator">Current</span>}
                  </div>
                  <p>Crisp, high-contrast day palette with natural paper tones and dark typography.</p>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                className={`theme-card-button ${theme === "dark" ? "selected" : ""}`}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <div className="theme-preview-box dark">
                  <div className="preview-top" />
                  <div className="preview-split">
                    <div className="preview-side" />
                    <div className="preview-main">
                      <div className="preview-line-title" />
                      <div className="preview-box-card" />
                    </div>
                  </div>
                </div>
                <div className="theme-info-content">
                  <div className="theme-label-row">
                    <span className="theme-title"><MoonIcon /> Dark Mode</span>
                    {theme === "dark" && <span className="theme-active-indicator">Current</span>}
                  </div>
                  <p>Sleek dark charcoal palette to reduce eye strain in low-light environments.</p>
                </div>
              </button>

              {/* System Option */}
              <button
                type="button"
                className={`theme-card-button ${theme === "system" ? "selected" : ""}`}
                onClick={() => setTheme("system")}
                aria-pressed={theme === "system"}
              >
                <div className="theme-preview-box system">
                  <div className="preview-top" />
                  <div className="preview-split">
                    <div className="preview-side" />
                    <div className="preview-main">
                      <div className="preview-line-title" />
                      <div className="preview-box-card" />
                    </div>
                  </div>
                </div>
                <div className="theme-info-content">
                  <div className="theme-label-row">
                    <span className="theme-title"><MonitorIcon /> System Preference</span>
                    {theme === "system" && <span className="theme-active-indicator">Current</span>}
                  </div>
                  <p>Automatically match your device's operating system dark/light mode setting.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Public Profile Card */}
        <div className="settings-card settings-section-anchor" id="profile">
          <div className="settings-card-head">
            <div className="settings-card-head-left">
              <div className="settings-card-icon">👤</div>
              <div>
                <h2>Public Profile</h2>
                <p>This information is shown to fellow decision makers and community members.</p>
              </div>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--teal)", background: "var(--teal-dim)", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>
              Personal Identity
            </span>
          </div>

          <div className="settings-card-body">
            {profileSuccess && (
              <div
                className="success-banner"
                style={{
                  marginBottom: 18,
                  padding: "10px 14px",
                  background: "var(--teal-dim)",
                  color: "var(--teal)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>✓</span> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="error-banner" style={{ marginBottom: 18 }}>
                {profileError}
              </div>
            )}

            {profileLoading ? (
              <div className="state-block" style={{ padding: "30px 20px" }}>Loading profile details…</div>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                  <div
                    className="avatar"
                    style={{
                      width: 68,
                      height: 68,
                      fontSize: 22,
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--brass-dim)",
                      color: "#72531C",
                      fontWeight: 600,
                      border: "2px solid var(--line)",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", zIndex: 0 }}>{userInitials}</span>
                    {avatarUrl || getAvatarUrl(userDisplayName) ? (
                      <img
                        src={avatarUrl || getAvatarUrl(userDisplayName)}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="avatarUrl" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                      Avatar Image URL
                    </label>
                    <input
                      id="avatarUrl"
                      type="url"
                      className="input"
                      placeholder="https://example.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
                        Or choose from curated personas:
                      </span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {Object.entries(CURATED_AVATARS).map(([key, url]) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => setAvatarUrl(url)}
                            style={{
                              border: avatarUrl === url ? "2px solid var(--brass)" : "2px solid transparent",
                              padding: 2,
                              borderRadius: "50%",
                              background: "none",
                              cursor: "pointer",
                              display: "flex",
                              transition: "transform 0.15s ease",
                            }}
                            title={`Choose ${key} avatar`}
                          >
                            <img
                              src={url}
                              alt={key}
                              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                            />
                          </button>
                        ))}
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            style={{
                              fontSize: 11,
                              color: "var(--ink-soft)",
                              background: "none",
                              border: "1px dashed var(--line)",
                              borderRadius: 12,
                              padding: "4px 8px",
                              cursor: "pointer",
                            }}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div>
                    <label htmlFor="name" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                      Email Address <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 400 }}>(Verified)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      disabled
                      className="input"
                      value={email}
                      style={{ opacity: 0.75, cursor: "not-allowed", background: "var(--paper)" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="bio" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                    Bio / About
                  </label>
                  <textarea
                    id="bio"
                    className="input"
                    rows={3}
                    placeholder="Share a short summary about your role, background, or decision domains…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={profileSaving} className="btn brass">
                    {profileSaving ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* User Interests Card */}
        <div className="settings-card settings-section-anchor" id="interests">
          <div className="settings-card-head">
            <div className="settings-card-head-left">
              <div className="settings-card-icon brass-icon">🎯</div>
              <div>
                <h2>Category Interests & Preferences</h2>
                <p>Select the categories you care about to personalize your decision discovery feed.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", background: "var(--teal-dim)", padding: "3px 10px", borderRadius: 12 }}>
                {selectedInterests.length} selected
              </span>
            </div>
          </div>

          <div className="settings-card-body">
            {interestsSuccess && (
              <div
                className="success-banner"
                style={{
                  marginBottom: 18,
                  padding: "10px 14px",
                  background: "var(--teal-dim)",
                  color: "var(--teal)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>✓</span> {interestsSuccess}
              </div>
            )}
            {interestsError && (
              <div className="error-banner" style={{ marginBottom: 18 }}>
                {interestsError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Click a tag to toggle it on or off:
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSelectAllInterests}
                  className="btn ghost"
                  style={{ fontSize: 11.5, padding: "4px 10px", margin: 0 }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearInterests}
                  className="btn ghost"
                  style={{ fontSize: 11.5, padding: "4px 10px", margin: 0 }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {AVAILABLE_CATEGORIES.map((cat) => {
                const selected = selectedInterests.includes(cat);
                const icon = CATEGORY_ICONS[cat] || "🏷️";
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`interest-chip ${selected ? "selected" : ""}`}
                    aria-pressed={selected}
                  >
                    <span>{icon}</span>
                    <span>{selected ? `✓ ${cat}` : `+ ${cat}`}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={interestsSaving}
                onClick={handleSaveInterests}
                className="btn brass"
              >
                {interestsSaving ? "Saving Interests…" : "Update Interests"}
              </button>
            </div>
          </div>
        </div>

        {/* Professional Account Security Card */}
        <div className="settings-card settings-section-anchor" id="security">
          <div className="settings-card-head">
            <div className="settings-card-head-left">
              <div className="settings-card-icon" style={{ background: "rgba(31, 111, 107, 0.1)", color: "var(--teal)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h2>Account Security</h2>
                <p>Update your account password. Choose a strong password with at least 8 characters.</p>
              </div>
            </div>
            <span style={{ fontSize: 11.5, color: "#059669", background: "#d1fae5", padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>
              End-to-End Encrypted
            </span>
          </div>

          <div className="settings-card-body">
            {passwordSuccess && (
              <div
                className="success-banner"
                style={{
                  marginBottom: 18,
                  padding: "10px 14px",
                  background: "var(--teal-dim)",
                  color: "var(--teal)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>✓</span> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="error-banner" style={{ marginBottom: 18 }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 620 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}>
                <div>
                  <label htmlFor="currentPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                    Current Password
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      required
                      className="input"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrent(!showCurrent)}
                      aria-label={showCurrent ? "Hide current password" : "Show current password"}
                      title={showCurrent ? "Hide password" : "Show password"}
                    >
                      {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label htmlFor="newPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                      New Password
                    </label>
                    <div className="password-input-wrap">
                      <input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        required
                        minLength={8}
                        className="input"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNew(!showNew)}
                        aria-label={showNew ? "Hide new password" : "Show new password"}
                        title={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--ink)" }}>
                      Confirm New Password
                    </label>
                    <div className="password-input-wrap">
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        required
                        minLength={8}
                        className="input"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirm(!showConfirm)}
                        aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                        title={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  Choose a unique password with at least 8 characters. We recommend combining letters, numbers, and symbols.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <button type="submit" disabled={passwordSaving} className="btn brass">
                  {passwordSaving ? "Updating Password…" : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
