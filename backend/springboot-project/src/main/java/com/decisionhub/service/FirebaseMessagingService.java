package com.decisionhub.service;

import com.decisionhub.model.FcmToken;
import com.decisionhub.model.User;
import com.decisionhub.repository.FcmTokenRepository;
import com.dto.FcmStatusResponse;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FirebaseMessagingService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseMessagingService.class);

    private final FcmTokenRepository tokenRepository;
    private final HttpClient httpClient;

    @Value("${firebase.enabled:true}")
    private boolean enabled;

    @Value("${firebase.project-id:decisionhub-team-003}")
    private String projectId;

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKey;

    @Value("${firebase.credentials-path:}")
    private String credentialsPath;

    public FirebaseMessagingService(FcmTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isConfigured() {
        return (serviceAccountKey != null && !serviceAccountKey.isBlank()) ||
               (credentialsPath != null && !credentialsPath.isBlank());
    }

    public String getProjectId() {
        return projectId;
    }

    @Transactional
    public FcmToken registerToken(User user, String token, String deviceType) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Device registration token is required");
        }
        Optional<FcmToken> existing = tokenRepository.findByToken(token.trim());
        if (existing.isPresent()) {
            FcmToken current = existing.get();
            current.setUser(user);
            current.setDeviceType(deviceType != null && !deviceType.isBlank() ? deviceType : "WEB");
            current.setUpdatedAt(LocalDateTime.now());
            log.info("Updated existing FCM token for user: {}", user.getEmail());
            return tokenRepository.save(current);
        } else {
            FcmToken newToken = new FcmToken(user, token.trim(), deviceType);
            log.info("Registered new FCM token for user: {} (device: {})", user.getEmail(), deviceType);
            return tokenRepository.save(newToken);
        }
    }

    @Transactional
    public void unregisterToken(String token) {
        if (token != null && !token.isBlank()) {
            tokenRepository.deleteByToken(token.trim());
            log.info("Unregistered FCM token: {}", token.substring(0, Math.min(10, token.length())) + "...");
        }
    }

    @Transactional
    public void unregisterUser(User user) {
        if (user != null && user.getId() != null) {
            tokenRepository.deleteByUserId(user.getId());
            log.info("Unregistered all FCM tokens for user: {}", user.getEmail());
        }
    }

    public int sendPushNotification(User recipient, String title, String body, String decisionId) {
        if (!enabled || recipient == null || recipient.getId() == null) {
            return 0;
        }

        List<FcmToken> tokens = tokenRepository.findByUserId(recipient.getId());
        if (tokens.isEmpty()) {
            log.debug("No active FCM tokens found for user: {}", recipient.getEmail());
            return 0;
        }

        AtomicInteger sentCount = new AtomicInteger(0);
        for (FcmToken tokenObj : tokens) {
            String token = tokenObj.getToken();
            try {
                boolean sent = dispatchToFcm(token, title, body, decisionId);
                if (sent) {
                    sentCount.incrementAndGet();
                }
            } catch (Exception e) {
                log.warn("Failed to dispatch FCM push notification to token: {} - {}", token, e.getMessage());
            }
        }
        log.info("Dispatched {} FCM push notification(s) to user: {}", sentCount.get(), recipient.getEmail());
        return sentCount.get();
    }

    public int sendTestNotification(User user) {
        return sendPushNotification(
                user,
                "DecisionHub Push Notification",
                "Your device is connected and ready to receive real-time voting alerts!",
                null
        );
    }

    public FcmStatusResponse getStatus(User user) {
        long count = (user != null && user.getId() != null) ? tokenRepository.countByUserId(user.getId()) : 0;
        String msg = isConfigured()
                ? "Firebase Cloud Messaging active in live delivery mode."
                : "Firebase Cloud Messaging active in local simulation mode (ready for live Google Service Account).";
        return new FcmStatusResponse(enabled, isConfigured(), projectId, count, msg);
    }

    private boolean dispatchToFcm(String token, String title, String body, String decisionId) {
        if (!isConfigured()) {
            // Local simulation / fallback mode when live Google Service Account is not supplied
            log.info("[FCM Push Notification Simulated] Token: {}, Title: '{}', Body: '{}', Decision: {}",
                    token.substring(0, Math.min(12, token.length())) + "...", title, body, decisionId);
            return true;
        }

        try {
            // FCM HTTP v1 JSON Payload
            String jsonPayload = String.format("""
                {
                  "message": {
                    "token": "%s",
                    "notification": {
                      "title": "%s",
                      "body": "%s"
                    },
                    "data": {
                      "decisionId": "%s",
                      "type": "PUSH_NOTIFICATION",
                      "click_action": "%s"
                    }
                  }
                }
                """,
                escapeJson(token),
                escapeJson(title),
                escapeJson(body),
                escapeJson(decisionId != null ? decisionId : ""),
                escapeJson(decisionId != null ? "/boards/" + decisionId : "/notifications")
            );

            String fcmEndpoint = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fcmEndpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + serviceAccountKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(6))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("FCM v1 message successfully sent: {}", response.body());
                return true;
            } else if (response.statusCode() == 404 || response.statusCode() == 410) {
                // Token expired or unregistered
                log.warn("FCM registration token expired or invalid, cleaning up: {}", token);
                tokenRepository.deleteByToken(token);
                return false;
            } else {
                log.warn("FCM v1 dispatch error (status {}): {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Error communicating with FCM endpoint: {}", e.getMessage());
            return false;
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
