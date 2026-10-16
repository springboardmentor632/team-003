package com.decisionhub;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CustomCriteriaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private String jwtToken;
    private Decision testDecision;
    private Option testOption1;
    private Option testOption2;

    @BeforeEach
    void setUp() {
        testUser = new User("Architect Alex", "alex.criteria@decisionhub.org", passwordEncoder.encode("Pass123456!"), "USER");
        testUser = userRepository.save(testUser);
        jwtToken = "Bearer " + jwtService.generateToken(testUser.getEmail());

        testDecision = new Decision();
        testDecision.setTitle("Cloud Storage Strategy");
        testDecision.setDescription("Comparing AWS S3 vs Cloudinary");
        testDecision.setCreatedBy(testUser.getName());
        testDecision.setCategory("Technology");
        testDecision.setPollType("SINGLE_CHOICE");
        testDecision.setVisibility("PUBLIC");
        testDecision.getCustomCriteria().add("Scalability");
        testDecision = decisionRepository.save(testDecision);

        testOption1 = new Option();
        testOption1.setName("AWS S3");
        testOption1.setDecision(testDecision);
        testOption1.setCostScore(8);
        testOption1.getCustomScores().put("Scalability", 10);
        testOption1 = optionRepository.save(testOption1);

        testOption2 = new Option();
        testOption2.setName("Cloudinary");
        testOption2.setDecision(testDecision);
        testOption2.setCostScore(6);
        testOption2.getCustomScores().put("Scalability", 8);
        testOption2 = optionRepository.save(testOption2);
    }

    @Test
    @DisplayName("GET /api/decisions/{id} returns custom criteria and option custom scores")
    void testGetDecisionWithCustomCriteria() throws Exception {
        mockMvc.perform(get("/api/decisions/" + testDecision.getId())
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customCriteria", hasItem("Scalability")))
                .andExpect(jsonPath("$.options[0].customScores.Scalability", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/decisions/{id}/criteria adds new criterion on the fly with scores")
    void testAddCustomCriterionOnTheFly() throws Exception {
        String payload = String.format("""
            {
                "name": "Security & Compliance",
                "scores": {
                    "%d": 9,
                    "%d": 7
                }
            }
            """, testOption1.getId(), testOption2.getId());

        mockMvc.perform(post("/api/decisions/" + testDecision.getId() + "/criteria")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customCriteria", hasItem("Security & Compliance")));
    }

    @Test
    @DisplayName("PUT /api/decisions/{id}/options/{optionId}/criteria updates individual score on the fly")
    void testUpdateOptionCriteriaScore() throws Exception {
        String payload = """
            {
                "criterion": "Developer Experience",
                "score": 9
            }
            """;

        mockMvc.perform(put("/api/decisions/" + testDecision.getId() + "/options/" + testOption1.getId() + "/criteria")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customCriteria", hasItem("Developer Experience")));
    }

    @Test
    @DisplayName("DELETE /api/decisions/{id}/criteria/{name} removes criterion on the fly")
    void testRemoveCustomCriterion() throws Exception {
        mockMvc.perform(delete("/api/decisions/" + testDecision.getId() + "/criteria/Scalability")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customCriteria", not(hasItem("Scalability"))));
    }
}
