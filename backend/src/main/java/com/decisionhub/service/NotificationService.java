package com.decisionhub.service;

import com.decisionhub.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> list(String email);
    void markRead(Long id, String email);
}