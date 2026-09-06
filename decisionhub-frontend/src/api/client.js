import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("decisionhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("decisionhub_token");
      localStorage.removeItem("decisionhub_user");
      if (!window.location.pathname.startsWith("/login")) {
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
