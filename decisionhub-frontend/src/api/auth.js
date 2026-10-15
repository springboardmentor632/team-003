import client, { API_BASE_URL } from "./client";

export function register({ fullName, email, password, role = "USER" }) {
  return client.post("/api/auth/register", { name: fullName, email, password, role });
}

export function login({ email, password }) {
  return client.post("/api/auth/login", { email, password });
}

export function requestPasswordReset(email) {
  return client.post("/api/auth/password-reset/request", { email });
}

export function confirmPasswordReset({ token, newPassword }) {
  return client.post("/api/auth/password-reset/confirm", { token, newPassword });
}

export function getCurrentUser() {
  return client.get("/api/users/me");
}

export function loginOAuth2Google({ email, name }) {
  return client.post("/api/auth/oauth2/google", { email, name });
}

export function demoGoogleLogin() {
  return client.get("/api/auth/oauth2/demo-google");
}

export function getGoogleOAuth2Url() {
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}/oauth2/authorization/google`;
}
