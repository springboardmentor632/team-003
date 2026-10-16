package com.decisionhub;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.dto.VoteRequest;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VotingValidationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private DecisionRepository decisions;
    @Autowired private OptionRepository options;
    @Autowired private VoteRepository votes;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtService jwtService;
    private final ObjectMapper mapper = new ObjectMapper();

    private User voter1;
    private User voter2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        voter1 = users.findByEmail("voting.voter1@decisionhub.test").orElseGet(() -> {
            User u = new User("Voter 1", "voting.voter1@decisionhub.test", encoder.encode("pass"), "USER");
            return users.save(u);
        });

        voter2 = users.findByEmail("voting.voter2@decisionhub.test").orElseGet(() -> {
            User u = new User("Voter 2", "voting.voter2@decisionhub.test", encoder.encode("pass"), "USER");
            return users.save(u);
        });

        token1 = "Bearer " + jwtService.generateToken(voter1.getEmail());
        token2 = "Bearer " + jwtService.generateToken(voter2.getEmail());
    }

    @Test
    @DisplayName("Voting Validation: Closed decision rejects votes with 400 Bad Request")
    void testVoting_ClosedDecision_Rejected() throws Exception {
        Decision d = new Decision();
        d.setTitle("Closed Board Test");
        d.setCreatedBy("Admin");
        d.setCategory("Technology");
        d.setVisibility("PUBLIC");
        d.setPollType("SINGLE_CHOICE");
        d.setClosed(true);
        Decision saved = decisions.save(d);

        Option opt = new Option();
        opt.setName("Option 1");
        opt.setDecision(saved);
        Option savedOpt = options.save(opt);

        VoteRequest voteReq = new VoteRequest();
        voteReq.setOptionId(savedOpt.getId());

        MvcResult result = mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(voteReq)))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(body.has("error"));
        assertTrue(body.get("error").asText().contains("closed"));
    }

    @Test
    @DisplayName("Voting Validation: RATING poll rejects ratings outside 1-5 range")
    void testVoting_RatingPoll_BoundaryValidation() throws Exception {
        Decision d = new Decision();
        d.setTitle("Rating Board Test");
        d.setCreatedBy("Admin");
        d.setCategory("Technology");
        d.setVisibility("PUBLIC");
        d.setPollType("RATING");
        d.setClosed(false);
        Decision saved = decisions.save(d);

        Option opt = new Option();
        opt.setName("Rating Option");
        opt.setDecision(saved);
        Option savedOpt = options.save(opt);

        // Rating too low (0)
        VoteRequest lowReq = new VoteRequest();
        lowReq.setOptionId(savedOpt.getId());
        lowReq.setRating(0);

        mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(lowReq)))
                .andExpect(status().isBadRequest());

        // Rating too high (6)
        VoteRequest highReq = new VoteRequest();
        highReq.setOptionId(savedOpt.getId());
        highReq.setRating(6);

        mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(highReq)))
                .andExpect(status().isBadRequest());

        // Valid rating (5)
        VoteRequest validReq = new VoteRequest();
        validReq.setOptionId(savedOpt.getId());
        validReq.setRating(5);

        MvcResult success = mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode successBody = mapper.readTree(success.getResponse().getContentAsString());
        assertEquals(1, successBody.get("totalVotes").asInt());
    }

    @Test
    @DisplayName("Voting Validation: Anonymous vote rejected when allowAnonymousVoting is false")
    void testVoting_AnonymousRejectedWhenDisabled() throws Exception {
        Decision d = new Decision();
        d.setTitle("Non-Anonymous Board");
        d.setCreatedBy("Admin");
        d.setCategory("Technology");
        d.setVisibility("PUBLIC");
        d.setPollType("SINGLE_CHOICE");
        d.setAllowAnonymousVoting(false);
        d.setClosed(false);
        Decision saved = decisions.save(d);

        Option opt = new Option();
        opt.setName("Option Anon");
        opt.setDecision(saved);
        Option savedOpt = options.save(opt);

        VoteRequest anonVote = new VoteRequest();
        anonVote.setOptionId(savedOpt.getId());
        anonVote.setAnonymous(true);

        mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(anonVote)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Voting Validation: Vote retraction decreases tally and recalculates results")
    void testVoting_RetractVote_RecalculatesTotals() throws Exception {
        Decision d = new Decision();
        d.setTitle("Retraction Board");
        d.setCreatedBy("Admin");
        d.setCategory("Technology");
        d.setVisibility("PUBLIC");
        d.setPollType("MULTIPLE_CHOICE");
        d.setClosed(false);
        Decision saved = decisions.save(d);

        Option opt = new Option();
        opt.setName("Option Retract");
        opt.setDecision(saved);
        Option savedOpt = options.save(opt);

        // Cast vote
        VoteRequest vote = new VoteRequest();
        vote.setOptionId(savedOpt.getId());

        mockMvc.perform(post("/api/decisions/{id}/votes", saved.getId())
                .header("Authorization", token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(vote)))
                .andExpect(status().isOk());

        // Retract vote
        MvcResult retracted = mockMvc.perform(delete("/api/decisions/{id}/votes/{optionId}", saved.getId(), savedOpt.getId())
                .header("Authorization", token1))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode retractedBody = mapper.readTree(retracted.getResponse().getContentAsString());
        assertEquals(0, retractedBody.get("totalVotes").asInt());
    }
}
