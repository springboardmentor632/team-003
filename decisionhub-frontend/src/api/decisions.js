import client from "./client";

export function createDecision(payload) {
  return client.post("/api/decisions", payload);
}

export function listPublicDecisions({ category, page = 0, size = 20 } = {}) {
  return client.get("/api/decisions/public", { params: { category: category || undefined, page, size } });
}

export function listMyDecisions({ page = 0, size = 20 } = {}) {
  return client.get("/api/decisions/mine", { params: { page, size } });
}

export function getDecision(id) {
  return client.get(`/api/decisions/${id}`);
}

export function updateDecision(id, payload) {
  return client.put(`/api/decisions/${id}`, payload);
}

export function deleteDecision(id) {
  return client.delete(`/api/decisions/${id}`);
}

export function addOption(decisionId, payload) {
  return client.post(`/api/decisions/${decisionId}/options`, payload);
}

export function castVote(decisionId, { optionId, rating, anonymous }) {
  return client.post(`/api/decisions/${decisionId}/votes`, { optionId, rating, anonymous });
}

export function retractVote(decisionId, optionId) {
  return client.delete(`/api/decisions/${decisionId}/votes/${optionId}`);
}

export function getResults(decisionId) {
  return client.get(`/api/decisions/${decisionId}/votes/results`);
}
