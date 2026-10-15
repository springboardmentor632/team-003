package com.decisionhub.service;

import com.decisionhub.model.FcmToken;
import com.decisionhub.model.User;
import com.decisionhub.repository.FcmTokenRepository;
import com.dto.FcmStatusResponse;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FirebaseMessagingServiceTest {

    @Mock
    private FcmTokenRepository tokenRepository;

    private FirebaseMessagingService fcmService;
    private User testUser;

    @BeforeEach
    void setUp() {
        fcmService = new FirebaseMessagingService(tokenRepository);
        ReflectionTestUtils.setField(fcmService, "enabled", true);
        ReflectionTestUtils.setField(fcmService, "projectId", "decisionhub-test");
        ReflectionTestUtils.setField(fcmService, "serviceAccountKey", "");

        testUser = new User();
        testUser.setId(10L);
        testUser.setName("Developer Alice");
        testUser.setEmail("alice@decisionhub.org");
    }

    @Test
    void registerToken_savesNewTokenWhenNotPresent() {
        when(tokenRepository.findByToken("token_alpha_123")).thenReturn(Optional.empty());
        when(tokenRepository.save(any(FcmToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FcmToken token = fcmService.registerToken(testUser, "token_alpha_123", "WEB");

        assertNotNull(token);
        assertEquals("token_alpha_123", token.getToken());
        assertEquals("WEB", token.getDeviceType());
        assertEquals(testUser, token.getUser());
        verify(tokenRepository).save(any(FcmToken.class));
    }

    @Test
    void registerToken_updatesExistingToken() {
        FcmToken existing = new FcmToken(testUser, "token_alpha_123", "ANDROID");
        when(tokenRepository.findByToken("token_alpha_123")).thenReturn(Optional.of(existing));
        when(tokenRepository.save(any(FcmToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FcmToken updated = fcmService.registerToken(testUser, "token_alpha_123", "WEB");

        assertNotNull(updated);
        assertEquals("WEB", updated.getDeviceType());
        verify(tokenRepository).save(existing);
    }

    @Test
    void unregisterToken_callsRepositoryDelete() {
        fcmService.unregisterToken("token_alpha_123");
        verify(tokenRepository).deleteByToken("token_alpha_123");
    }

    @Test
    void unregisterUser_callsRepositoryDeleteByUserId() {
        fcmService.unregisterUser(testUser);
        verify(tokenRepository).deleteByUserId(10L);
    }

    @Test
    void sendPushNotification_dispatchesInSimulatedModeWhenTokensExist() {
        FcmToken t1 = new FcmToken(testUser, "device_token_1", "WEB");
        FcmToken t2 = new FcmToken(testUser, "device_token_2", "IOS");
        when(tokenRepository.findByUserId(10L)).thenReturn(List.of(t1, t2));

        int sent = fcmService.sendPushNotification(testUser, "New Board Created", "Please review", "42");

        assertEquals(2, sent);
    }

    @Test
    void sendPushNotification_returnsZeroWhenNoTokensFound() {
        when(tokenRepository.findByUserId(10L)).thenReturn(List.of());

        int sent = fcmService.sendPushNotification(testUser, "New Board Created", "Please review", "42");

        assertEquals(0, sent);
    }

    @Test
    void sendTestNotification_triggersPushSuccessfully() {
        FcmToken t1 = new FcmToken(testUser, "device_token_test", "WEB");
        when(tokenRepository.findByUserId(10L)).thenReturn(List.of(t1));

        int sent = fcmService.sendTestNotification(testUser);

        assertEquals(1, sent);
    }

    @Test
    void getStatus_returnsActiveMetrics() {
        when(tokenRepository.countByUserId(10L)).thenReturn(3L);

        FcmStatusResponse status = fcmService.getStatus(testUser);

        assertTrue(status.isEnabled());
        assertFalse(status.isConfigured()); // Empty serviceAccountKey means simulated mode
        assertEquals(3L, status.getRegisteredTokens());
        assertEquals("decisionhub-test", status.getProjectId());
        assertNotNull(status.getMessage());
    }
}
