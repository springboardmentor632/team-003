import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import NotificationItem from "../components/NotificationItem";
import {
  listNotifications,
  markNotificationRead,
} from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listNotifications()
      .then(({ data }) => {
        setItems(data);
      })
      .catch((err) => {
        setError(
          extractErrorMessage(
            err,
            "Couldn't load notifications"
          )
        );
      });
  }, []);

  const read = async (item) => {
    if (item.read) return;

    try {
      const { data } = await markNotificationRead(item.id);

      setItems((all) =>
        all.map((entry) =>
          entry.id === item.id ? data : entry
        )
      );
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Couldn't mark notification as read"
        )
      );
    }
  };

  return (
    <div>
      <TopBar
        eyebrow="Stay in the loop"
        title="Notifications"
        subtitle="Updates from the decisions and conversations you follow."
      />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="state-block">
          <h3>You’re all caught up</h3>
          <p>
            Votes and comments on your boards will
            show up here.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="recent-boards">
            {items.map((item) => (
              <Link
                key={item.id}
                className="recent-board-row"
                to={
                  item.decisionId
                    ? `/boards/${item.decisionId}`
                    : "/dashboard"
                }
                onClick={() => read(item)}
              >
                <NotificationItem
                  title={
                    item.type
                      ?.replaceAll("_", " ")
                      .toLowerCase()
                  }
                  message={item.message}
                  time={item.createdAt}
                  unread={!item.read}
                />

                <span className="recent-arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}