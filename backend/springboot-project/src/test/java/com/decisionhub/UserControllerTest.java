package com.decisionhub;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerTest {

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
    private VoteRepository voteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private String jwtToken;
    private Decision sampleDecision;

    @BeforeEach
    void setUp() {
        testUser = new User("Maya Profile", "maya.profile@decisionhub.org", passwordEncoder.encode("CurrentPass123!"), "USER");
        testUser.setBio("Product Lead");
        testUser.setAvatarUrl("https://example.com/maya.png");
        testUser = userRepository.save(testUser);
        jwtToken = "Bearer " + jwtService.generateToken(testUser.getEmail());

        sampleDecision = new Decision();
        sampleDecision.setTitle("Cloud Architecture Stack");
        sampleDecision.setDescription("Selecting public cloud platform");
        sampleDecision.setCategory("Technology");
        sampleDecision.setPollType("SINGLE_CHOICE");
        sampleDecision.setCreatedBy(testUser.getEmail());
        sampleDecision = decisionRepository.save(sampleDecision);

        Option option1 = new Option();
        option1.setDecision(sampleDecision);
        option1.setName("AWS ECS Fargate");
        optionRepository.save(option1);

        Vote vote = new Vote(sampleDecision, option1, testUser);
        vote.setRating(5);
        voteRepository.save(vote);
    }

    @Test
    @DisplayName("GET /api/users/me returns authenticated user profile")
    void testGetProfile_Success() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("maya.profile@decisionhub.org")))
                .andExpect(jsonPath("$.name", is("Maya Profile")))
                .andExpect(jsonPath("$.bio", is("Product Lead")));
    }

    @Test
    @DisplayName("PUT /api/users/me updates name, bio, avatar, and interests")
    void testUpdateProfile_Success() throws Exception {
        String payload = """
            {
                "name": "Maya R. Chen",
                "bio": "VP of Product & Engineering",
                "avatarUrl": "https://example.com/new-avatar.png",
                "interests": ["Technology", "Career", "Finance"]
            }
            """;

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Maya R. Chen")))
                .andExpect(jsonPath("$.bio", is("VP of Product & Engineering")))
                .andExpect(jsonPath("$.avatarUrl", is("https://example.com/new-avatar.png")))
                .andExpect(jsonPath("$.interests", hasSize(3)))
                .andExpect(jsonPath("$.interests", hasItem("Technology")));
    }

    @Test
    @DisplayName("PUT /api/users/me/password changes password with valid current password")
    void testChangePassword_Success() throws Exception {
        String payload = """
            {
                "currentPassword": "CurrentPass123!",
                "newPassword": "UpdatedNewPassword123!"
            }
            """;

        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("PUT /api/users/me/password rejects incorrect current password")
    void testChangePassword_InvalidCurrentPassword() throws Exception {
        String payload = """
            {
                "currentPassword": "WrongCurrentPassword!",
                "newPassword": "UpdatedNewPassword123!"
            }
            """;

        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET & PUT /api/users/me/interests manages category preferences")
    void testInterestsWorkflow() throws Exception {
        String payload = """
            {
                "interests": ["Technology", "Healthcare"]
            }
            """;

        mockMvc.perform(put("/api/users/me/interests")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$", hasItem("Healthcare")));

        mockMvc.perform(get("/api/users/me/interests")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("POST & GET & DELETE /api/users/me/saved-decisions bookmarks and unsaves decisions")
    void testSavedDecisionsWorkflow() throws Exception {
        Long decisionId = sampleDecision.getId();

        // 1. Save Decision
        mockMvc.perform(post("/api/users/me/saved-decisions/" + decisionId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.saved", is(true)));

        // 2. Lookup IDs
        mockMvc.perform(get("/api/users/me/saved-decisions/ids")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItem(decisionId.intValue())));

        // 3. List Saved Decisions
        mockMvc.perform(get("/api/users/me/saved-decisions")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(decisionId.intValue())));

        // 4. Unsave Decision
        mockMvc.perform(delete("/api/users/me/saved-decisions/" + decisionId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved", is(false)));

        // 5. Verify empty
        mockMvc.perform(get("/api/users/me/saved-decisions/ids")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/users/me/votes returns personal voting history audit")
    void testGetVotingHistory() throws Exception {
        mockMvc.perform(get("/api/users/me/votes")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].decisionTitle", is("Cloud Architecture Stack")))
                .andExpect(jsonPath("$[0].optionTitle", is("AWS ECS Fargate")))
                .andExpect(jsonPath("$[0].rating", is(5)));
    }
}
