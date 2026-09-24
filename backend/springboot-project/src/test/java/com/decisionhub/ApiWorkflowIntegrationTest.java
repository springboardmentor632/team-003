package com.decisionhub;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.mockito.ArgumentCaptor;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Exercises the main API journeys that back the React application. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(ApiWorkflowIntegrationTest.MailConfiguration.class)
class ApiWorkflowIntegrationTest {
    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private JavaMailSender mailSender;

    @Test
    void collaborativeDecisionJourneyWorksEndToEnd() throws Exception {
        User owner = user("workflow.owner@decisionhub.test", "Workflow Owner", "USER");
        User participant = user("workflow.participant@decisionhub.test", "Workflow Participant", "USER");
        User admin = user("workflow.admin@decisionhub.test", "Workflow Admin", "ADMIN");

        MvcResult created = mockMvc.perform(post("/api/decisions/create")
                .header("Authorization", bearer(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Integration board","description":"Complete workflow coverage","category":"Technology",
                     "visibility":"PUBLIC","pollType":"SINGLE_CHOICE","allowAnonymousVoting":false,
                     "options":[
                       {"title":"Option A","costScore":3,"benefitsScore":9,"riskScore":2,"timeScore":7,"convenienceScore":8},
                       {"title":"Option B","costScore":8,"benefitsScore":5,"riskScore":6,"timeScore":5,"convenienceScore":6}
                     ]}
                    """))
            .andExpect(status().isOk()).andReturn();
        JsonNode board = json(created);
        long boardId = board.path("id").asLong();
        long optionId = board.path("options").get(0).path("id").asLong();
        assertEquals("Technology", board.path("category").asText());
        assertEquals("PUBLIC", board.path("visibility").asText());
        assertEquals(2, board.path("options").size());

        MvcResult publicBoards = mockMvc.perform(get("/api/decisions/public")
                .header("Authorization", bearer(participant))
                .param("category", "Technology").param("page", "0").param("size", "10"))
            .andExpect(status().isOk()).andReturn();
        assertTrue(json(publicBoards).path("content").size() > 0);

        MvcResult voted = mockMvc.perform(post("/api/decisions/{id}/votes", boardId)
                .header("Authorization", bearer(participant)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"optionId\":" + optionId + ",\"anonymous\":false}"))
            .andExpect(status().isOk()).andReturn();
        assertEquals(1, json(voted).path("totalVotes").asInt());
        assertEquals(1, json(voted).path("options").get(0).path("voteCount").asInt());

        mockMvc.perform(post("/api/decisions/{id}/comments", boardId)
                .header("Authorization", bearer(participant)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"A persisted discussion comment\"}"))
            .andExpect(status().isOk());
        MvcResult comments = mockMvc.perform(get("/api/decisions/{id}/comments", boardId)
                .header("Authorization", bearer(owner)))
            .andExpect(status().isOk()).andReturn();
        assertEquals(1, json(comments).size());

        MvcResult notifications = mockMvc.perform(get("/api/notifications").header("Authorization", bearer(owner)))
            .andExpect(status().isOk()).andReturn();
        assertEquals(2, json(notifications).size());

        MvcResult community = mockMvc.perform(post("/api/communities")
                .header("Authorization", bearer(owner)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Integration community\",\"description\":\"API-backed collaboration\"}"))
            .andExpect(status().isOk()).andReturn();
        long communityId = json(community).path("id").asLong();
        MvcResult joined = mockMvc.perform(post("/api/communities/{id}/members", communityId)
                .header("Authorization", bearer(participant)))
            .andExpect(status().isOk()).andReturn();
        assertEquals(2, json(joined).path("memberCount").asInt());

        mockMvc.perform(post("/api/decisions/{id}/reports", boardId)
                .header("Authorization", bearer(participant)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Integration moderation check\"}"))
            .andExpect(status().isOk());
        MvcResult reports = mockMvc.perform(get("/api/reports").param("status", "PENDING")
                .header("Authorization", bearer(admin)))
            .andExpect(status().isOk()).andReturn();
        assertTrue(json(reports).size() > 0);
        mockMvc.perform(get("/api/reports").header("Authorization", bearer(participant)))
            .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/communities/{id}/members/{memberId}/role", communityId, participant.getId())
                .header("Authorization", bearer(owner)).param("role", "MODERATOR"))
            .andExpect(status().isOk());
        mockMvc.perform(put("/api/communities/{id}", communityId).header("Authorization", bearer(participant))
                .contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"Moderator-updated description\"}"))
            .andExpect(status().isOk());

        MvcResult analytics = mockMvc.perform(get("/api/analytics/summary").header("Authorization", bearer(owner)))
            .andExpect(status().isOk()).andReturn();
        assertTrue(json(analytics).path("totalBoards").asInt() > 0);

        mockMvc.perform(get("/api/users/me").header("Authorization", bearer(owner)))
            .andExpect(status().isOk());
        MvcResult reset = mockMvc.perform(post("/api/auth/password-reset/request").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"workflow.owner@decisionhub.test\"}"))
            .andExpect(status().isOk()).andReturn();
        assertTrue(json(reset).path("message").asText().contains("link has been sent"));
        assertTrue(!json(reset).has("token"));
        ArgumentCaptor<SimpleMailMessage> email = ArgumentCaptor.forClass(SimpleMailMessage.class);
        org.mockito.Mockito.verify(mailSender).send(email.capture());
        String resetToken = email.getValue().getText().replaceAll("(?s).*token=([^\\s]+).*", "$1");
        assertTrue(resetToken.length() > 20);
        mockMvc.perform(post("/api/auth/password-reset/confirm").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + resetToken + "\",\"newPassword\":\"new-password-123\"}"))
            .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/password-reset/confirm").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + resetToken + "\",\"newPassword\":\"new-password-123\"}"))
            .andExpect(status().isBadRequest());
    }

    private User user(String email, String name, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode("password123"));
        return users.save(user);
    }

    private String bearer(User user) { return "Bearer " + jwtService.generateToken(user.getEmail()); }
    private JsonNode json(MvcResult result) throws Exception { return objectMapper.readTree(result.getResponse().getContentAsString()); }

    @TestConfiguration
    static class MailConfiguration {
        @Bean
        @Primary
        JavaMailSender mailSender() { return org.mockito.Mockito.mock(JavaMailSender.class); }
    }
}
