package com.decisionhub.dto;

import com.decisionhub.entity.NotificationType;
import java.time.Instant;

public record NotificationResponse(Long id, NotificationType type, String message, Long decisionId, Instant createdAt, Instant readAt) {}