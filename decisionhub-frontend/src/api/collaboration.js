import client from "./client";

export const listComments = (decisionId) => client.get(`/api/decisions/${decisionId}/comments`);
export const createComment = (decisionId, payload) => client.post(`/api/decisions/${decisionId}/comments`, payload);
export const reactToComment = (decisionId, commentId) => client.post(`/api/decisions/${decisionId}/comments/${commentId}/reactions`);
export const deleteComment = (decisionId, commentId) => client.delete(`/api/decisions/${decisionId}/comments/${commentId}`);
export const updateComment = (decisionId, commentId, payload) => client.put(`/api/decisions/${decisionId}/comments/${commentId}`, payload);
export const listSuggestions = (decisionId) => client.get(`/api/decisions/${decisionId}/suggestions`);
export const createSuggestion = (decisionId, payload) => client.post(`/api/decisions/${decisionId}/suggestions`, payload);

export const listCommunities = () => client.get("/api/communities");
export const getCommunity = (id) => client.get(`/api/communities/${id}`);
export const createCommunity = (payload) => client.post("/api/communities", payload);
export const joinCommunity = (id) => client.post(`/api/communities/${id}/members`);
export const leaveCommunity = (id) => client.delete(`/api/communities/${id}/members/me`);
export const listInvitations = () => client.get("/api/communities/invitations");
export const acceptInvitation = (id) => client.post(`/api/communities/invitations/${id}/accept`);
export const declineInvitation = (id) => client.post(`/api/communities/invitations/${id}/decline`);

export const listNotifications = () => client.get("/api/notifications");
export const notificationSummary = () => client.get("/api/notifications/summary");
export const markNotificationRead = (id) => client.post(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.post("/api/notifications/read-all");
export const analyticsSummary = () => client.get("/api/analytics/summary");
export const reportDecision = (id, payload) => client.post(`/api/decisions/${id}/reports`, payload);
export const listReports = (status) => client.get("/api/reports", { params: { status } });
export const updateReport = (id, status) => client.put(`/api/reports/${id}`, null, { params: { status } });
export const setCommentHidden = (decisionId, commentId, value) => client.put(`/api/decisions/${decisionId}/comments/${commentId}/hidden`, null, { params: { value } });
export const listFeedback = () => client.get("/api/feedback");
export const createFeedback = (payload) => client.post("/api/feedback", payload);

export const listDiscussions = () => client.get("/api/discussions");
export const getDiscussion = (id) => client.get(`/api/discussions/${id}`);
export const createDiscussion = ({ title, content }) => {
  const params = new URLSearchParams();
  params.append("title", title);
  params.append("content", content);
  return client.post("/api/discussions", null, { params });
};
export const deleteDiscussion = (id) => client.delete(`/api/discussions/${id}`);
export const listDiscussionComments = (discussionId) => client.get(`/api/discussions/${discussionId}/comments`);
export const createDiscussionComment = (discussionId, { content, parentCommentId }) => {
  const params = new URLSearchParams();
  params.append("content", content);
  if (parentCommentId) params.append("parentCommentId", parentCommentId);
  return client.post(`/api/discussions/${discussionId}/comments`, null, { params });
};
export const deleteDiscussionComment = (discussionId, commentId) => client.delete(`/api/discussions/${discussionId}/comments/${commentId}`);
