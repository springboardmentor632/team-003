import client from "./client";

export function register({ fullName, email, password }) {
  return client.post("/api/auth/register", { fullName, email, password });
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
