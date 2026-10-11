package com.decisionhub;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityRbacTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtService jwtService;

    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setup() {
        regularUser = users.findByEmail("rbac.user@decisionhub.test").orElseGet(() -> {
            User u = new User("RBAC User", "rbac.user@decisionhub.test", encoder.encode("pass"), "USER");
            return users.save(u);
        });

        adminUser = users.findByEmail("rbac.admin@decisionhub.test").orElseGet(() -> {
            User u = new User("RBAC Admin", "rbac.admin@decisionhub.test", encoder.encode("pass"), "ADMIN");
            return users.save(u);
        });
    }

    @Test
    @DisplayName("Public endpoints allow unauthenticated access")
    void testPublicEndpoints_NoAuth_Success() throws Exception {
        // Actuator health probe
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        // Password reset request
        mockMvc.perform(post("/api/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nonexistent@test.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints reject unauthenticated requests with 401/403")
    void testProtectedEndpoints_NoToken_ForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/decisions"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Tampered / invalid JWT token is rejected")
    void testTamperedToken_Rejected() throws Exception {
        String invalidToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature";
        mockMvc.perform(get("/api/users/me").header("Authorization", invalidToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Non-admin user accessing moderation reports receives 403 Forbidden")
    void testNonAdmin_ModerationReports_Forbidden() throws Exception {
        String token = "Bearer " + jwtService.generateToken(regularUser.getEmail());
        mockMvc.perform(get("/api/reports").header("Authorization", token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin user accessing moderation reports receives 200 OK")
    void testAdmin_ModerationReports_Success() throws Exception {
        String token = "Bearer " + jwtService.generateToken(adminUser.getEmail());
        mockMvc.perform(get("/api/reports").header("Authorization", token))
                .andExpect(status().isOk());
    }
}
