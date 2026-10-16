import client, { API_BASE_URL } from "./client";

export function uploadFile({ file, decisionId, optionId, fileType }) {
  const formData = new FormData();
  formData.append("file", file);
  if (decisionId) formData.append("decisionId", decisionId);
  if (optionId) formData.append("optionId", optionId);
  if (fileType) formData.append("fileType", fileType);

  return client.post("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getDecisionAttachments(decisionId) {
  return client.get(`/api/files/decision/${decisionId}`);
}

export function getOptionAttachments(optionId) {
  return client.get(`/api/files/option/${optionId}`);
}

export function deleteAttachment(attachmentId) {
  return client.delete(`/api/files/${attachmentId}`);
}

export function resolveFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${base}${path}`;
}
