package com.decisionhub;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.decisionhub.service.FirebaseMessagingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FcmNotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FirebaseMessagingService fcmService;

    private User authUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        authUser = userRepository.save(new User("Push Test User", "push.user@decisionhub.org", "pass1234", "USER"));
        jwtToken = "Bearer " + jwtService.generateToken(authUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/notifications/fcm/register registers device token successfully")
    void testRegisterFcmToken_Success() throws Exception {
        String json = """
            {
                "token": "fcm_test_device_token_abc_123",
                "deviceType": "WEB"
            }
            """;

        mockMvc.perform(post("/api/notifications/fcm/register")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/notifications/fcm/status returns active FCM metrics")
    void testGetFcmStatus_Success() throws Exception {
        fcmService.registerToken(authUser, "token_status_probe_1", "WEB");

        mockMvc.perform(get("/api/notifications/fcm/status")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.registeredTokens").value(1))
                .andExpect(jsonPath("$.projectId").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/notifications/fcm/test dispatches test push notification")
    void testSendTestPush_Success() throws Exception {
        fcmService.registerToken(authUser, "token_for_test_push", "WEB");

        mockMvc.perform(post("/api/notifications/fcm/test")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.sentTokens").value(1));
    }

    @Test
    @DisplayName("POST /api/notifications/fcm/unregister removes device token")
    void testUnregisterFcmToken_Success() throws Exception {
        fcmService.registerToken(authUser, "token_to_remove_xyz", "WEB");

        String json = """
            {
                "token": "token_to_remove_xyz"
            }
            """;

        mockMvc.perform(post("/api/notifications/fcm/unregister")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Unauthenticated FCM register request is rejected with 403 Forbidden")
    void testUnauthenticatedRegister_Forbidden() throws Exception {
        String json = """
            {
                "token": "unauth_token"
            }
            """;

        mockMvc.perform(post("/api/notifications/fcm/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }
}
