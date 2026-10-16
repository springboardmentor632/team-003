package com.decisionhub.service;

import com.decisionhub.dto.CustomCriterionRequest;
import com.decisionhub.dto.OptionCriteriaScoreRequest;
import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.model.*;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DecisionServiceTest {

    @Mock private DecisionRepository decisions;
    @Mock private OptionRepository options;
    @Mock private VoteRepository votes;
    @Mock private CommunityRepository communities;
    @Mock private UserRepository users;
    @Mock private NotificationService notifications;
    @Mock private AuthorizationService authorization;

    @InjectMocks
    private DecisionService decisionService;

    private User testUser;
    private Decision testDecision;
    private Option testOption1;
    private Option testOption2;

    @BeforeEach
    void setUp() {
        testUser = new User("Harish", "harish@decisionhub.local", "hashedpass", "USER");
        testUser.setId(10L);

        testDecision = new Decision();
        testDecision.setId(100L);
        testDecision.setTitle("Framework Selection");
        testDecision.setCreatedBy("Harish");
        testDecision.setPollType("SINGLE_CHOICE");
        testDecision.setVisibility("PUBLIC");
        testDecision.setClosed(false);

        testOption1 = new Option();
        testOption1.setId(201L);
        testOption1.setName("Spring Boot");
        testOption1.setDecision(testDecision);

        testOption2 = new Option();
        testOption2.setId(202L);
        testOption2.setName("Go");
        testOption2.setDecision(testDecision);
    }

    @Test
    @DisplayName("createDecision - Saves decision, options, and hydrates totals")
    void testCreateDecision_Success() {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("New Database Architecture");
        request.setCategory("Technology");
        request.setPollType("RATING");
        request.setVisibility("PUBLIC");

        OptionRequest optReq = new OptionRequest();
        optReq.setTitle("PostgreSQL");
        optReq.setCostScore(4);
        optReq.setBenefitsScore(9);
        request.setOptions(List.of(optReq));

        when(decisions.save(any(Decision.class))).thenAnswer(i -> {
            Decision d = i.getArgument(0);
            d.setId(101L);
            return d;
        });
        when(options.save(any(Option.class))).thenReturn(testOption1);
        when(votes.findByDecisionId(101L)).thenReturn(List.of());
        when(options.findByDecisionId(101L)).thenReturn(List.of(testOption1));

        Decision created = decisionService.createDecision(request, testUser);

        assertNotNull(created);
        assertEquals("Harish", created.getCreatedBy());
        verify(decisions).save(any(Decision.class));
        verify(options).save(any(Option.class));
    }

    @Test
    @DisplayName("createDecision - Rejects non-member creating board in private community")
    void testCreateDecision_CommunityNonMember_ThrowsSecurityException() {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Private Board");
        request.setCommunityId(50L);

        Community community = new Community("Internal Engineering", "Desc", new User());
        community.setId(50L);

        when(communities.findById(50L)).thenReturn(Optional.of(community));
        when(authorization.isAdmin(testUser)).thenReturn(false);
        when(authorization.isCommunityMember(community, testUser)).thenReturn(false);

        assertThrows(SecurityException.class, () -> decisionService.createDecision(request, testUser));
    }

    @Test
    @DisplayName("castVote - Voting on closed board throws IllegalStateException")
    void testCastVote_ClosedBoard_ThrowsException() {
        testDecision.setClosed(true);
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));

        VoteRequest voteReq = new VoteRequest();
        voteReq.setOptionId(201L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> decisionService.castVote(100L, voteReq, testUser));
        assertTrue(ex.getMessage().contains("closed"));
    }

    @Test
    @DisplayName("castVote - Duplicate vote on SINGLE_CHOICE throws IllegalStateException")
    void testCastVote_DuplicateSingleChoice_ThrowsException() {
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findById(201L)).thenReturn(Optional.of(testOption1));
        when(votes.existsByDecisionIdAndVoterId(100L, 10L)).thenReturn(true);

        VoteRequest voteReq = new VoteRequest();
        voteReq.setOptionId(201L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> decisionService.castVote(100L, voteReq, testUser));
        assertTrue(ex.getMessage().contains("already voted"));
    }

    @Test
    @DisplayName("castVote - Rating poll requires rating between 1 and 5")
    void testCastVote_InvalidRating_ThrowsException() {
        testDecision.setPollType("RATING");
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findById(201L)).thenReturn(Optional.of(testOption1));

        VoteRequest invalidLow = new VoteRequest();
        invalidLow.setOptionId(201L);
        invalidLow.setRating(0);

        IllegalArgumentException exLow = assertThrows(IllegalArgumentException.class,
                () -> decisionService.castVote(100L, invalidLow, testUser));
        assertTrue(exLow.getMessage().contains("rating from 1 to 5 is required"));

        VoteRequest invalidHigh = new VoteRequest();
        invalidHigh.setOptionId(201L);
        invalidHigh.setRating(6);

        IllegalArgumentException exHigh = assertThrows(IllegalArgumentException.class,
                () -> decisionService.castVote(100L, invalidHigh, testUser));
        assertTrue(exHigh.getMessage().contains("rating from 1 to 5 is required"));
    }

    @Test
    @DisplayName("castVote - Valid vote persists and triggers notification to board owner")
    void testCastVote_Valid_SavesVoteAndNotifies() {
        User boardOwner = new User("Owner", "owner@decisionhub.local", "pass", "USER");
        boardOwner.setId(99L);
        testDecision.setCreatedBy("Owner");

        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findById(201L)).thenReturn(Optional.of(testOption1));
        when(votes.existsByDecisionIdAndVoterId(100L, 10L)).thenReturn(false);
        when(votes.findByDecisionIdAndOptionIdAndVoterId(100L, 201L, 10L)).thenReturn(Optional.empty());
        when(users.findFirstByName("Owner")).thenReturn(Optional.of(boardOwner));

        Vote savedVote = new Vote(testDecision, testOption1, testUser);
        when(votes.save(any(Vote.class))).thenReturn(savedVote);
        when(votes.findByDecisionId(100L)).thenReturn(List.of(savedVote));
        when(options.findByDecisionId(100L)).thenReturn(List.of(testOption1));

        VoteRequest voteReq = new VoteRequest();
        voteReq.setOptionId(201L);

        Decision result = decisionService.castVote(100L, voteReq, testUser);

        assertNotNull(result);
        assertEquals(1, result.getTotalVotes());
        verify(votes).save(any(Vote.class));
        verify(notifications).notify(eq(boardOwner), eq(NotificationType.VOTE), anyString(), eq(testDecision));
    }

    @Test
    @DisplayName("retractVote - Deletes existing vote and updates totals")
    void testRetractVote_Success() {
        Vote existingVote = new Vote(testDecision, testOption1, testUser);
        when(votes.findByDecisionIdAndOptionIdAndVoterId(100L, 201L, 10L)).thenReturn(Optional.of(existingVote));
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(votes.findByDecisionId(100L)).thenReturn(List.of());
        when(options.findByDecisionId(100L)).thenReturn(List.of(testOption1));

        Decision result = decisionService.retractVote(100L, 201L, testUser);

        assertNotNull(result);
        verify(votes).delete(existingVote);
        assertEquals(0, result.getTotalVotes());
    }

    @Test
    @DisplayName("deleteDecision - Non-owner and non-admin cannot delete board")
    void testDeleteDecision_Unauthorized_ThrowsSecurityException() {
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        User stranger = new User("Stranger", "stranger@decisionhub.local", "pass", "USER");
        stranger.setId(77L);

        when(authorization.isAdmin(stranger)).thenReturn(false);
        when(authorization.canModerate(testDecision, stranger)).thenReturn(false);

        assertThrows(SecurityException.class, () -> decisionService.deleteDecision(100L, stranger));
        verify(decisions, never()).delete(any());
    }

    @Test
    @DisplayName("addCustomCriterion - Adds new criterion and scores options on the fly")
    void testAddCustomCriterion_Success() {
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findByDecisionId(100L)).thenReturn(List.of(testOption1));
        when(votes.findByDecisionId(100L)).thenReturn(List.of());

        CustomCriterionRequest req = new CustomCriterionRequest("Scalability", java.util.Map.of(201L, 9));
        Decision result = decisionService.addCustomCriterion(100L, req, testUser);

        assertNotNull(result);
        assertTrue(testDecision.getCustomCriteria().contains("Scalability"));
        assertEquals(9, testOption1.getCustomScores().get("Scalability"));
        verify(options).save(testOption1);
        verify(decisions).save(testDecision);
    }

    @Test
    @DisplayName("removeCustomCriterion - Removes criterion from board and all option scores")
    void testRemoveCustomCriterion_Success() {
        testDecision.getCustomCriteria().add("Scalability");
        testOption1.getCustomScores().put("Scalability", 9);

        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findByDecisionId(100L)).thenReturn(List.of(testOption1));
        when(votes.findByDecisionId(100L)).thenReturn(List.of());

        Decision result = decisionService.removeCustomCriterion(100L, "Scalability", testUser);

        assertNotNull(result);
        assertFalse(testDecision.getCustomCriteria().contains("Scalability"));
        assertFalse(testOption1.getCustomScores().containsKey("Scalability"));
        verify(options).save(testOption1);
        verify(decisions).save(testDecision);
    }

    @Test
    @DisplayName("updateOptionCriteriaScore - Updates score for an option on the fly")
    void testUpdateOptionCriteriaScore_Success() {
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findById(201L)).thenReturn(Optional.of(testOption1));
        when(votes.findByDecisionId(100L)).thenReturn(List.of());
        when(options.findByDecisionId(100L)).thenReturn(List.of(testOption1));

        OptionCriteriaScoreRequest req = new OptionCriteriaScoreRequest("Security", 8);
        Decision result = decisionService.updateOptionCriteriaScore(100L, 201L, req, testUser);

        assertNotNull(result);
        assertTrue(testDecision.getCustomCriteria().contains("Security"));
        assertEquals(8, testOption1.getCustomScores().get("Security"));
        verify(options).save(testOption1);
    }

    @Test
    @DisplayName("updateOptionCriteriaScore - Rejects score out of range (1-10)")
    void testUpdateOptionCriteriaScore_InvalidScore_Throws() {
        when(decisions.findById(100L)).thenReturn(Optional.of(testDecision));
        when(options.findById(201L)).thenReturn(Optional.of(testOption1));

        OptionCriteriaScoreRequest req = new OptionCriteriaScoreRequest("Security", 15);
        assertThrows(IllegalArgumentException.class, () -> decisionService.updateOptionCriteriaScore(100L, 201L, req, testUser));
    }

    @Test
    @DisplayName("getAverageScore - Computes weighted average incorporating standard and custom criteria")
    void testCustomCriteriaScoreIncludedInAverageScore() {
        testOption1.setCostScore(8);
        testOption1.setBenefitsScore(9);
        testOption1.setRiskScore(7);
        // 3 standard scores sum to 24 (avg 8.0)
        assertEquals(8.0, testOption1.getAverageScore());

        // Add 2 custom scores
        testOption1.getCustomScores().put("Scalability", 10);
        testOption1.getCustomScores().put("Security", 6);
        // Total sum = 8 + 9 + 7 + 10 + 6 = 40 across 5 criteria -> avg 8.0
        assertEquals(8.0, testOption1.getAverageScore());
    }
}
