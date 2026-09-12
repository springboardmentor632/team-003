import client from "./client";

export const listComments = (decisionId) => client.get(`/api/decisions/${decisionId}/comments`);
export const createComment = (decisionId, payload) => client.post(`/api/decisions/${decisionId}/comments`, payload);
export const reactToComment = (decisionId, commentId) => client.post(`/api/decisions/${decisionId}/comments/${commentId}/reactions`);
export const deleteComment = (decisionId, commentId) => client.delete(`/api/decisions/${decisionId}/comments/${commentId}`);

export const listCommunities = () => client.get("/api/communities");
export const createCommunity = (payload) => client.post("/api/communities", payload);
export const joinCommunity = (id) => client.post(`/api/communities/${id}/members`);
export const leaveCommunity = (id) => client.delete(`/api/communities/${id}/members/me`);

export const listNotifications = () => client.get("/api/notifications");
export const markNotificationRead = (id) => client.post(`/api/notifications/${id}/read`);
export const analyticsSummary = () => client.get("/api/analytics/summary");
export const reportDecision = (id, payload) => client.post(`/api/decisions/${id}/reports`, payload);
export const listReports = (status) => client.get("/api/reports", { params: { status } });
export const updateReport = (id, status) => client.put(`/api/reports/${id}`, null, { params: { status } });
