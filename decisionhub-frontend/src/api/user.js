import client from "./client";

export function getProfile() {
  return client.get("/api/users/me");
}

export function updateProfile(data) {
  return client.put("/api/users/me", data);
}

export function changePassword({ currentPassword, newPassword }) {
  return client.put("/api/users/me/password", { currentPassword, newPassword });
}

export function getUserInterests() {
  return client.get("/api/users/me/interests");
}

export function updateUserInterests(interests) {
  return client.put("/api/users/me/interests", { interests });
}

export function listSavedDecisions() {
  return client.get("/api/users/me/saved-decisions");
}

export function getSavedDecisionIds() {
  return client.get("/api/users/me/saved-decisions/ids");
}

export function saveDecision(decisionId) {
  return client.post(`/api/users/me/saved-decisions/${decisionId}`);
}

export function unsaveDecision(decisionId) {
  return client.delete(`/api/users/me/saved-decisions/${decisionId}`);
}

export function listVotingHistory() {
  return client.get("/api/users/me/votes");
}
