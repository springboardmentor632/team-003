package com.decisionhub.controller;

import com.decisionhub.model.Notification;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notifications; private final UserRepository users;
    public NotificationController(NotificationService notifications, UserRepository users) { this.notifications = notifications; this.users = users; }
    @GetMapping public List<Notification> list() { return notifications.list(current()); }
    @GetMapping("/summary") public Map<String, Long> summary() { return Map.of("unread", notifications.unread(current())); }
    @PostMapping("/{id}/read") public Notification read(@PathVariable Long id) { return notifications.markRead(id, current()); }
    @PostMapping("/read-all") public Map<String, Integer> readAll() { return Map.of("updated", notifications.markAllRead(current())); }
    @PostMapping("/system") public Map<String, String> system(@RequestParam String email, @RequestParam String message) {
        if (!"ADMIN".equalsIgnoreCase(current().getRole())) throw new SecurityException("Admin access is required");
        User recipient = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        notifications.system(recipient, message); return Map.of("message", "System notification sent");
    }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
