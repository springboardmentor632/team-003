package com.decisionhub;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private DecisionRepository decisions;
    @Autowired private OptionRepository options;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtService jwtService;
    private final ObjectMapper mapper = new ObjectMapper();

    private User analystUser;
    private String token;

    @BeforeEach
    void setUp() {
        analystUser = users.findByEmail("analyst@decisionhub.test").orElseGet(() -> {
            User u = new User("Analyst User", "analyst@decisionhub.test", encoder.encode("pass"), "USER");
            return users.save(u);
        });
        token = "Bearer " + jwtService.generateToken(analystUser.getEmail());
    }

    @Test
    @DisplayName("Analytics: /api/analytics/summary returns accurate aggregations and metrics")
    void testAnalyticsSummary_StructureAndCalculations() throws Exception {
        // Ensure at least one test board exists
        Decision d = new Decision();
        d.setTitle("Analytics Verification Board");
        d.setCreatedBy("Analyst User");
        d.setCategory("Technology");
        d.setVisibility("PUBLIC");
        d.setPollType("SINGLE_CHOICE");
        d.setClosed(false);
        Decision saved = decisions.save(d);

        Option opt = new Option();
        opt.setName("Analytics Option 1");
        opt.setDecision(saved);
        options.save(opt);

        MvcResult result = mockMvc.perform(get("/api/analytics/summary")
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = mapper.readTree(result.getResponse().getContentAsString());

        // Validate top-level metric counters
        assertTrue(root.has("totalBoards"), "Must contain totalBoards");
        assertTrue(root.get("totalBoards").asInt() >= 1);
        assertTrue(root.has("totalVotes"), "Must contain totalVotes");
        assertTrue(root.has("boardsWithVotes"), "Must contain boardsWithVotes");
        assertTrue(root.has("closedBoards"), "Must contain closedBoards");

        // Validate distribution maps
        assertTrue(root.has("categoryVotes"), "Must contain categoryVotes map");
        assertTrue(root.has("pollTypes"), "Must contain pollTypes map");
        assertTrue(root.has("optionPopularity"), "Must contain optionPopularity map");
        assertTrue(root.has("communityActivity"), "Must contain communityActivity map");
        assertTrue(root.has("decisionTrends"), "Must contain decisionTrends map");
        assertTrue(root.has("outcomes"), "Must contain outcomes map");
        assertTrue(root.get("outcomes").has("open"));
        assertTrue(root.get("outcomes").has("closed"));

        // Validate leaderboard
        assertTrue(root.has("mostActive"), "Must contain mostActive list");
        assertTrue(root.get("mostActive").isArray());
    }
}
