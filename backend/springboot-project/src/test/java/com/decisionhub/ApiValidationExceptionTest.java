package com.decisionhub;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiValidationExceptionTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtService jwtService;
    private final ObjectMapper mapper = new ObjectMapper();

    private String token;

    @BeforeEach
    void setUp() {
        User u = users.findByEmail("val.user@decisionhub.test").orElseGet(() -> {
            User newUser = new User("Validation User", "val.user@decisionhub.test", encoder.encode("pass"), "USER");
            return users.save(newUser);
        });
        token = "Bearer " + jwtService.generateToken(u.getEmail());
    }

    @Test
    @DisplayName("Validation: Non-existent decision returns 400 Bad Request with descriptive message")
    void testGetDecision_NotFound_Returns400() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/decisions/999999")
                .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(body.has("error"));
        assertTrue(body.get("error").asText().contains("not found"));
    }

    @Test
    @DisplayName("Validation: Creating discussion with blank title returns 400 Bad Request")
    void testCreateDiscussion_BlankTitle_Returns400() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/discussions")
                .header("Authorization", token)
                .param("title", "   ")
                .param("content", "Valid content body"))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(body.has("error"));
        assertTrue(body.get("error").asText().contains("title is required"));
    }

    @Test
    @DisplayName("Validation: Submitting comment with blank content returns 400 Bad Request")
    void testCreateComment_BlankContent_Returns400() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/decisions/1/comments")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(body.has("error"));
    }
}
