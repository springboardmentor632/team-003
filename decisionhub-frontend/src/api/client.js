import axios from "axios";

// Match the local Vite host by default. This avoids a hostname-family mismatch
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
}

const getStorage = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== "undefined" && localStorage && typeof localStorage.getItem === "function") {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
};

client.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url && config.url.startsWith("/api/auth/");
  const storage = getStorage();
  const token = storage?.getItem?.("decisionhub_token");
  if (token && isTokenExpired(token)) {
    storage?.removeItem?.("decisionhub_token");
    storage?.removeItem?.("decisionhub_user");
    if (!isAuthEndpoint && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return config;
  }
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isAuthEndpoint = error?.config?.url?.startsWith("/api/auth/");
    const hasErrorBody = Boolean(error?.response?.data?.error);
    if (status === 401 || (status === 403 && !isAuthEndpoint && !hasErrorBody)) {
      const storage = getStorage();
      storage?.removeItem?.("decisionhub_token");
      storage?.removeItem?.("decisionhub_user");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;

/** Extracts a readable message from a Spring Boot error response body. */
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.fields) {
    const fields = error.response.data.fields;
    return Object.values(fields)[0] || fallback;
  }
  if (error?.message) return error.message;
  return fallback;
}
