package com.decisionhub.controller;

import com.decisionhub.dto.NotificationResponse;
import com.decisionhub.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public List<NotificationResponse> list() { return service.list(email()); }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) { service.markRead(id, email()); }

    private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
}