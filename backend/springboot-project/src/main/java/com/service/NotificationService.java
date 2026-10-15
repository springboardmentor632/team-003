package com.decisionhub.service;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Notification;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.User;
import com.decisionhub.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    private final FirebaseMessagingService fcmService;

    public NotificationService(NotificationRepository notifications) {
        this(notifications, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public NotificationService(NotificationRepository notifications,
                               @org.springframework.beans.factory.annotation.Autowired(required = false) FirebaseMessagingService fcmService) {
        this.notifications = notifications;
        this.fcmService = fcmService;
    }

    public void notify(User user, NotificationType type, String message, Decision decision) {
        if (user == null) return;
        Notification notification = new Notification(user, type, message);
        notification.setDecision(decision);
        notifications.save(notification);

        if (fcmService != null) {
            String title = "DecisionHub: " + (type != null ? type.name().replace('_', ' ') : "Notification");
            String decId = decision != null ? String.valueOf(decision.getId()) : null;
            try {
                fcmService.sendPushNotification(user, title, message, decId);
            } catch (Exception e) {
                // Non-blocking for in-app persistence
            }
        }
    }
    public void notifyOncePerDay(User user, NotificationType type, String message, Decision decision) {
        if (user == null || decision == null || notifications.existsByRecipientIdAndTypeAndDecisionIdAndCreatedAtAfter(user.getId(), type, decision.getId(), LocalDateTime.now().minusDays(1))) return;
        notify(user, type, message, decision);
    }
    public void system(User user, String message) { notify(user, NotificationType.SYSTEM, message, null); }
    public List<Notification> list(User user) { return notifications.findByRecipientIdOrderByCreatedAtDesc(user.getId()); }
    public long unread(User user) { return notifications.countByRecipientIdAndReadAtIsNull(user.getId()); }
    public Notification markRead(Long id, User user) {
        Notification notification = notifications.findById(id).orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) throw new SecurityException("Not your notification");
        notification.setReadAt(LocalDateTime.now());
        return notifications.save(notification);
    }
    @org.springframework.transaction.annotation.Transactional
    public int markAllRead(User user) { return notifications.markAllRead(user.getId(), LocalDateTime.now()); }
}
