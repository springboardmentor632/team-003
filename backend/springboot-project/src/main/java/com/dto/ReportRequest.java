package com.decisionhub.dto;

public class ReportRequest {
    private String reason;
    private Long commentId;
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
}
