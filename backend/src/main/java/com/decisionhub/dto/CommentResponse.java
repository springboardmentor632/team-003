package com.decisionhub.dto;

import java.time.Instant;

public record CommentResponse(Long id, String content, String authorName, Instant createdAt) {}