import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  acceptInvitation,
  declineInvitation,
  listInvitations,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/collaboration";
import { extractErrorMessage } from "../api/client";
import { getInitials, notificationInitials, timeAgo } from "../utils/decisionHelpers";
import {
  isPushSupported,
  getLocalPushPermission,
  getSavedPushToken,
  requestPushPermission,
  disablePushNotifications,
  sendTestPush,
  getFcmStatus,
} from "../api/push";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState("");
  const [pushStatusMsg, setPushStatusMsg] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [fcmDetails, setFcmDetails] = useState(null);

  const checkPush = () => {
    if (!isPushSupported()) return;
    const hasLocalToken = !!getSavedPushToken();
    const perm = getLocalPushPermission();
    setPushEnabled(hasLocalToken && perm === "granted");

    getFcmStatus()
      .then(({ data }) => setFcmDetails(data))
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([listNotifications(), listInvitations()])
      .then(([notifications, pending]) => {
        setItems(notifications.data || []);
        setInvitations(pending.data || []);
      })
      .catch((err) => setError(extractErrorMessage(err, "Couldn't load notifications")));

    checkPush();
  }, []);

  const handleEnablePush = async () => {
    setPushBusy(true);
    setPushStatusMsg("");
    setError("");
    try {
      await requestPushPermission(user?.id);
      setPushEnabled(true);
      setPushStatusMsg("Push notifications enabled! Real-time alerts will be delivered to this device.");
      checkPush();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not enable push notifications"));
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    setPushStatusMsg("");
    try {
      await disablePushNotifications();
      setPushEnabled(false);
      setPushStatusMsg("Push notifications disabled on this device.");
      checkPush();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to disable push notifications"));
    } finally {
      setPushBusy(false);
    }
  };

  const handleTestPush = async () => {
    setPushBusy(true);
    setPushStatusMsg("");
    setError("");
    try {
      const { data } = await sendTestPush();
      setPushStatusMsg(`Test push dispatched to ${data.sentTokens || 1} registered device(s)! Check your browser notifications.`);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to send test push notification"));
    } finally {
      setPushBusy(false);
    }
  };

  const read = async (item) => {
    if (!item.read) {
      const { data } = await markNotificationRead(item.id);
      setItems((all) => all.map((entry) => (entry.id === item.id ? data : entry)));
      window.dispatchEvent(new Event("decisionhub:notifications-changed"));
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((all) => all.map((item) => ({ ...item, read: true })));
      window.dispatchEvent(new Event("decisionhub:notifications-changed"));
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't mark notifications as read"));
    }
  };

  const respondToInvitation = async (invitation, action) => {
    try {
      if (action === "accept") await acceptInvitation(invitation.id);
      else await declineInvitation(invitation.id);
      setInvitations((all) => all.filter((item) => item.id !== invitation.id));
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update invitation"));
    }
  };

  return (
    <div>
      <TopBar
        eyebrow="Stay in the loop"
        title="Notifications"
        subtitle="Updates from the decisions and conversations you follow."
        action={
          items.some((item) => !item.read) ? (
            <button className="btn ghost" onClick={readAll}>
              Mark all read
            </button>
          ) : null
        }
      />

      {error && <div className="error-banner">{error}</div>}
      {pushStatusMsg && (
        <div
          className="success-banner"
          style={{
            background: "var(--teal-dim)",
            color: "var(--teal)",
            padding: "10px 14px",
            borderRadius: "var(--radius)",
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {pushStatusMsg}
        </div>
      )}

      {/* Push Notification Integration Card */}
      <section className="panel" style={{ marginBottom: 24, padding: "18px 22px" }} aria-label="Push Notifications Settings">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ fontSize: 14 }}>Firebase Cloud Messaging (FCM) Push</strong>
              <span className={`tag ${pushEnabled ? "brass" : ""}`} style={{ fontSize: 11 }}>
                {pushEnabled ? "Active on this browser" : "Not enabled"}
              </span>
            </div>
            <p style={{ color: "var(--ink-soft)", fontSize: 12.5, marginTop: 4 }}>
              Receive instant desktop & mobile alerts for new votes, mentions, and daily decision reminders.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {pushEnabled ? (
              <>
                <button
                  type="button"
                  className="btn brass"
                  onClick={handleTestPush}
                  disabled={pushBusy}
                  style={{ padding: "7px 14px", fontSize: 12 }}
                >
                  {pushBusy ? "Sending…" : "Send Test Push"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleDisablePush}
                  disabled={pushBusy}
                  style={{ padding: "7px 14px", fontSize: 12 }}
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn brass"
                onClick={handleEnablePush}
                disabled={pushBusy}
                style={{ padding: "8px 16px", fontSize: 12.5 }}
              >
                {pushBusy ? "Enabling…" : "🔔 Enable Push Notifications"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Community Invitations */}
      {invitations.length > 0 && (
        <section className="panel invitation-panel" style={{ marginBottom: 24 }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">Community access</span>
              <h2>Invitations</h2>
            </div>
            <span>{invitations.length} pending</span>
          </div>
          {invitations.map((invitation) => {
            const inviterName = invitation.inviter?.name || invitation.community?.owner?.name || "Community owner";
            return (
              <div className="invitation-row" key={invitation.id}>
                <div className="invitation-user">
                  <div className="avatar notification-avatar" aria-hidden="true">
                    {getInitials(inviterName)}
                  </div>
                  <div>
                    <strong>{invitation.community?.name || "Community"}</strong>
                    <p>Invited by {inviterName}</p>
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="btn ghost" onClick={() => respondToInvitation(invitation, "decline")}>
                    Decline
                  </button>
                  <button className="btn brass" onClick={() => respondToInvitation(invitation, "accept")}>
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* In-app Notification List */}
      {items.length === 0 && invitations.length === 0 ? (
        <div className="state-block">
          <h3>You’re all caught up</h3>
          <p>Votes, comments, and community invitations will show up here.</p>
        </div>
      ) : (
        items.length > 0 && (
          <div className="panel">
            <div className="recent-boards">
              {items.map((item) => (
                <Link
                  key={item.id}
                  className={`notification-row recent-board-row ${item.read ? "read" : "unread"}`}
                  to={item.decisionId ? `/boards/${item.decisionId}` : "/dashboard"}
                  onClick={() => read(item)}
                >
                  <span className={`recent-status ${item.read ? "closed" : "open"}`} />
                  <div className="avatar notification-avatar" aria-hidden="true">
                    {notificationInitials(item)}
                  </div>
                  <div className="recent-main">
                    <h3>{item.message}</h3>
                    <p>
                      {(item.type || "general").toLowerCase()} <span>·</span> {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <span className="recent-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
