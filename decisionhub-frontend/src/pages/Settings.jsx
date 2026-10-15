import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getProfile, updateProfile, changePassword, getUserInterests, updateUserInterests } from "../api/user";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/decisionHelpers";

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

export default function Settings() {
  const { user, updateUserProfile } = useAuth();

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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

  return (
    <div>
      <TopBar
        eyebrow="Account & Preferences"
        title="Settings & Profile"
        subtitle="Manage your personal profile, topic interests, and account security credentials."
      />

      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Card */}
        <div className="panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Public Profile</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 20 }}>
            This information is shown to fellow decision makers and community members.
          </p>

          {profileSuccess && (
            <div className="success-banner" style={{ marginBottom: 16, padding: "10px 14px", background: "var(--teal-dim)", color: "var(--teal)", borderRadius: "var(--radius)" }}>
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {profileError}
            </div>
          )}

          {profileLoading ? (
            <div>Loading profile details…</div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                <div
                  className="avatar"
                  style={{
                    width: 64,
                    height: 64,
                    fontSize: 22,
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--brass-soft)",
                    color: "var(--brass)",
                    fontWeight: 600,
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    getInitials(name || user?.fullName || "?")
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="avatarUrl" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Avatar Image URL</label>
                  <input
                    id="avatarUrl"
                    type="url"
                    className="input"
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="name" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Full Name</label>
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
                  <label htmlFor="email" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    className="input"
                    value={email}
                    style={{ opacity: 0.7, cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="bio" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Bio / About</label>
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

        {/* User Interests Card */}
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h2 style={{ fontSize: 18 }}>Category Interests & Preferences</h2>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {selectedInterests.length} selected
            </span>
          </div>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
            Select the categories you care about to personalize your decision discovery feed.
          </p>

          {interestsSuccess && (
            <div className="success-banner" style={{ marginBottom: 16, padding: "10px 14px", background: "var(--teal-dim)", color: "var(--teal)", borderRadius: "var(--radius)" }}>
              {interestsSuccess}
            </div>
          )}
          {interestsError && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {interestsError}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {AVAILABLE_CATEGORIES.map((cat) => {
              const selected = selectedInterests.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInterest(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    cursor: "pointer",
                    border: selected ? "1px solid var(--brass)" : "1px solid var(--border)",
                    background: selected ? "var(--brass-soft)" : "transparent",
                    color: selected ? "var(--brass)" : "var(--ink)",
                    fontWeight: selected ? 600 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  {selected ? `✓ ${cat}` : `+ ${cat}`}
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

        {/* Change Password Card */}
        <div className="panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Account Security</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 20 }}>
            Update your account password. Choose a strong password with at least 8 characters.
          </p>

          {passwordSuccess && (
            <div className="success-banner" style={{ marginBottom: 16, padding: "10px 14px", background: "var(--teal-dim)", color: "var(--teal)", borderRadius: "var(--radius)" }}>
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 450, marginBottom: 20 }}>
              <div>
                <label htmlFor="currentPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  className="input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="newPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={passwordSaving} className="btn brass">
                {passwordSaving ? "Updating Password…" : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
