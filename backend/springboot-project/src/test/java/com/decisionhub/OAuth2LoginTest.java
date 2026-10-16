package com.decisionhub;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OAuth2LoginTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    @DisplayName("OAuth2 Google Login: Creates new user and returns JWT token")
    void testGoogleOAuth2Login_NewUser_Success() throws Exception {
        String payload = """
            {
                "email": "new.google.user@decisionhub.test",
                "name": "Alex Google"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/auth/oauth2/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(response.has("token"), "Response must contain JWT token");
        assertEquals("Alex Google", response.path("name").asText());
        assertEquals("new.google.user@decisionhub.test", response.path("email").asText());
        assertEquals("USER", response.path("role").asText());

        // Verify token validity
        String token = response.path("token").asText();
        assertTrue(jwtService.validateToken(token));
        assertEquals("new.google.user@decisionhub.test", jwtService.extractEmail(token));

        // Verify user was persisted
        User user = userRepository.findByEmail("new.google.user@decisionhub.test").orElse(null);
        assertNotNull(user);
        assertEquals("Alex Google", user.getName());
    }

    @Test
    @DisplayName("OAuth2 Google Login: Existing user gets authenticated with new JWT token")
    void testGoogleOAuth2Login_ExistingUser_Success() throws Exception {
        // Pre-create user
        String email = "existing.google@decisionhub.test";
        userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User("Existing User", email, "secret", "USER");
            return userRepository.save(u);
        });

        String payload = "{\"email\":\"" + email + "\",\"name\":\"Existing User Updated\"}";

        MvcResult result = mockMvc.perform(post("/api/auth/oauth2/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(response.has("token"));
        assertEquals(email, response.path("email").asText());
    }

    @Test
    @DisplayName("OAuth2 Demo Google: Returns instant JWT token for evaluation")
    void testDemoGoogleLogin_Success() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/oauth2/demo-google"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(response.has("token"));
        assertEquals("google.user@decisionhub.local", response.path("email").asText());
    }
}
