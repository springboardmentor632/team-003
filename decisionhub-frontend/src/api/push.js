import client from "./client";

export function getFcmStatus() {
  return client.get("/api/notifications/fcm/status");
}

export function registerDeviceToken(token, deviceType = "WEB") {
  return client.post("/api/notifications/fcm/register", {
    token,
    deviceType,
  });
}

export function unregisterDeviceToken(token) {
  return client.post("/api/notifications/fcm/unregister", {
    token,
  });
}

export function sendTestPush() {
  return client.post("/api/notifications/fcm/test");
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function getLocalPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function getStorageItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
}

function setStorageItem(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

function removeStorageItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function getSavedPushToken() {
  return getStorageItem("decisionhub_fcm_token");
}

export async function requestPushPermission(userId) {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Push notification permission was denied.");
  }

  // Register service worker if available
  let swReg = null;
  try {
    swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (err) {
    console.warn("ServiceWorker registration notice:", err);
  }

  // Obtain or generate a consistent client device token
  let token = getStorageItem("decisionhub_fcm_token");
  if (!token) {
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    token = `fcm_web_${userId || "guest"}_${randomHex}`;
    setStorageItem("decisionhub_fcm_token", token);
  }

  // Register with backend
  await registerDeviceToken(token, "WEB");
  return { success: true, token, serviceWorker: swReg };
}

export async function disablePushNotifications() {
  const token = getStorageItem("decisionhub_fcm_token");
  if (token) {
    try {
      await unregisterDeviceToken(token);
    } catch (e) {
      console.warn("Failed to unregister FCM token on server:", e);
    }
    removeStorageItem("decisionhub_fcm_token");
  }
  return { success: true };
}

