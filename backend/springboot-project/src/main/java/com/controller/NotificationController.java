package com.decisionhub.controller;

import com.decisionhub.model.Notification;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.FirebaseMessagingService;
import com.decisionhub.service.NotificationService;
import com.dto.FcmStatusResponse;
import com.dto.FcmTokenRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notifications;
    private final UserRepository users;
    private final FirebaseMessagingService fcmService;

    public NotificationController(NotificationService notifications, UserRepository users, FirebaseMessagingService fcmService) {
        this.notifications = notifications;
        this.users = users;
        this.fcmService = fcmService;
    }

    @GetMapping public List<Notification> list() { return notifications.list(current()); }
    @GetMapping("/summary") public Map<String, Long> summary() { return Map.of("unread", notifications.unread(current())); }
    @PostMapping("/{id}/read") public Notification read(@PathVariable Long id) { return notifications.markRead(id, current()); }
    @PostMapping("/read-all") public Map<String, Integer> readAll() { return Map.of("updated", notifications.markAllRead(current())); }

    @PostMapping("/system") public Map<String, String> system(@RequestParam String email, @RequestParam String message) {
        if (!"ADMIN".equalsIgnoreCase(current().getRole())) throw new SecurityException("Admin access is required");
        User recipient = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        notifications.system(recipient, message); return Map.of("message", "System notification sent");
    }

    @PostMapping("/fcm/register")
    public Map<String, Object> registerFcmToken(@Valid @RequestBody FcmTokenRequest request) {
        User user = current();
        fcmService.registerToken(user, request.getToken(), request.getDeviceType());
        return Map.of("status", "SUCCESS", "message", "FCM device registration token registered successfully");
    }

    @PostMapping("/fcm/unregister")
    public Map<String, Object> unregisterFcmToken(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        if (token != null) {
            fcmService.unregisterToken(token);
        } else {
            fcmService.unregisterUser(current());
        }
        return Map.of("status", "SUCCESS", "message", "FCM token unregistered successfully");
    }

    @PostMapping("/fcm/test")
    public Map<String, Object> testFcmPush() {
        User user = current();
        int sent = fcmService.sendTestNotification(user);
        return Map.of(
            "status", "SUCCESS",
            "message", "Test push notification dispatched",
            "sentTokens", sent
        );
    }

    @GetMapping("/fcm/status")
    public FcmStatusResponse getFcmStatus() {
        return fcmService.getStatus(current());
    }

    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
