package com.decisionhub.service.impl;

import com.decisionhub.dto.NotificationResponse;
import com.decisionhub.entity.Notification;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notifications;
    private final UserRepository users;

    public NotificationServiceImpl(NotificationRepository notifications, UserRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> list(String email) {
        Long userId = users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found")).getId();
        return notifications.findByRecipientIdOrderByCreatedAtDesc(userId).stream().map(this::response).toList();
    }

    @Override
    @Transactional
    public void markRead(Long id, String email) {
        Notification notification = notifications.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getRecipient().getEmail().equals(email)) throw new ResourceNotFoundException("Notification not found");
        notification.setReadAt(Instant.now());
    }

    private NotificationResponse response(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getType(), notification.getMessage(),
                notification.getDecision() == null ? null : notification.getDecision().getId(), notification.getCreatedAt(), notification.getReadAt());
    }
}