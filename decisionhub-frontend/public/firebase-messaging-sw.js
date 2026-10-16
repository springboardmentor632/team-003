// Firebase Cloud Messaging Service Worker for DecisionHub
/* eslint-disable no-restricted-globals */

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

// Push notification event listener
self.addEventListener("push", function (event) {
  let title = "DecisionHub Notification";
  let options = {
    body: "You have a new voting update in DecisionHub.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {},
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        title = payload.notification.title || title;
        options.body = payload.notification.body || options.body;
      } else if (payload.title) {
        title = payload.title;
        options.body = payload.body || options.body;
      }
      if (payload.data) {
        options.data = payload.data;
      }
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event listener
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const decisionId = event.notification.data ? event.notification.data.decisionId : null;
  const targetPath = decisionId ? `/boards/${decisionId}` : "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && "focus" in client) {
          if (client.url.includes(targetPath)) {
            return client.focus();
          } else {
            client.navigate(targetPath);
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath);
      }
    })
  );
});
