package com.decisionhub.service;

import com.decisionhub.dto.ChangePasswordRequest;
import com.decisionhub.dto.UserProfileUpdateRequest;
import com.decisionhub.dto.VotingHistoryResponse;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.SavedDecision;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SavedDecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private SavedDecisionRepository savedDecisionRepository;
    @Mock
    private VoteRepository voteRepository;
    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private DecisionService decisionService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;
    private User testUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, savedDecisionRepository, voteRepository, decisionRepository, decisionService, passwordEncoder);
        testUser = new User("Alice Developer", "alice@example.com", "encodedPassword123", "USER");
        testUser.setId(42L);
        testUser.setBio("Full-stack engineer");
        testUser.setAvatarUrl("https://example.com/avatar.png");
        testUser.setInterests(new HashSet<>(Arrays.asList("Technology", "Career")));
    }

    @Test
    void testGetCurrentProfileSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));

        User result = userService.getCurrentProfile("alice@example.com");
        assertNotNull(result);
        assertEquals("Alice Developer", result.getName());
        assertEquals("alice@example.com", result.getEmail());
        assertEquals("Full-stack engineer", result.getBio());
        assertTrue(result.getInterests().contains("Technology"));
    }

    @Test
    void testUpdateProfile() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileUpdateRequest update = new UserProfileUpdateRequest(
                "Alice Wonder", "Principal architect", "https://example.com/new.png", Set.of("Finance", "AI")
        );

        User updated = userService.updateProfile("alice@example.com", update);
        assertEquals("Alice Wonder", updated.getName());
        assertEquals("Principal architect", updated.getBio());
        assertEquals("https://example.com/new.png", updated.getAvatarUrl());
        assertEquals(2, updated.getInterests().size());
        assertTrue(updated.getInterests().contains("Finance"));
    }

    @Test
    void testChangePasswordSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPass123", "encodedPassword123")).thenReturn(true);
        when(passwordEncoder.encode("newSecretPass456")).thenReturn("encodedNewSecretPass456");

        ChangePasswordRequest req = new ChangePasswordRequest("oldPass123", "newSecretPass456");
        userService.changePassword("alice@example.com", req);

        verify(userRepository).save(testUser);
        assertEquals("encodedNewSecretPass456", testUser.getPassword());
    }

    @Test
    void testChangePasswordIncorrectCurrentPassword() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPass", "encodedPassword123")).thenReturn(false);

        ChangePasswordRequest req = new ChangePasswordRequest("wrongPass", "newSecretPass456");
        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("alice@example.com", req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testChangePasswordTooShort() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));

        ChangePasswordRequest req = new ChangePasswordRequest("oldPass123", "short");
        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("alice@example.com", req));
    }

    @Test
    void testUpdateAndGetInterests() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Set<String> newCategories = Set.of("Travel", "Lifestyle");
        Set<String> savedInterests = userService.updateInterests("alice@example.com", newCategories);

        assertEquals(2, savedInterests.size());
        assertTrue(savedInterests.contains("Travel"));
    }

    @Test
    void testSaveAndUnsaveDecision() {
        Decision decision = new Decision();
        decision.setId(101L);
        decision.setTitle("Next Architecture");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(decisionRepository.findById(101L)).thenReturn(Optional.of(decision));
        when(savedDecisionRepository.existsByUserIdAndDecisionId(42L, 101L)).thenReturn(false);

        Map<String, Object> saveResult = userService.saveDecision("alice@example.com", 101L);
        assertEquals("SUCCESS", saveResult.get("status"));
        assertEquals(true, saveResult.get("saved"));
        verify(savedDecisionRepository).save(any(SavedDecision.class));

        Map<String, Object> unsaveResult = userService.unsaveDecision("alice@example.com", 101L);
        assertEquals("SUCCESS", unsaveResult.get("status"));
        assertEquals(false, unsaveResult.get("saved"));
        verify(savedDecisionRepository).deleteByUserIdAndDecisionId(42L, 101L);
    }

    @Test
    void testGetSavedDecisionIds() {
        Decision d1 = new Decision(); d1.setId(10L);
        Decision d2 = new Decision(); d2.setId(20L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(savedDecisionRepository.findByUserIdOrderByCreatedAtDesc(42L)).thenReturn(List.of(
                new SavedDecision(testUser, d1),
                new SavedDecision(testUser, d2)
        ));

        List<Long> ids = userService.getSavedDecisionIds("alice@example.com");
        assertEquals(List.of(10L, 20L), ids);
    }

    @Test
    void testGetSavedDecisions() {
        Decision d1 = new Decision(); d1.setId(10L); d1.setTitle("Decision One");
        Decision d2 = new Decision(); d2.setId(20L); d2.setTitle("Decision Two");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(savedDecisionRepository.findByUserIdOrderByCreatedAtDesc(42L)).thenReturn(List.of(
                new SavedDecision(testUser, d1),
                new SavedDecision(testUser, d2)
        ));
        when(decisionService.getDecisionById(10L)).thenReturn(d1);
        when(decisionService.getDecisionById(20L)).thenReturn(d2);

        List<Decision> decisions = userService.getSavedDecisions("alice@example.com");
        assertEquals(2, decisions.size());
        assertEquals("Decision One", decisions.get(0).getTitle());
        assertEquals("Decision Two", decisions.get(1).getTitle());
        verify(decisionService).getDecisionById(10L);
        verify(decisionService).getDecisionById(20L);
    }

    @Test
    void testGetVotingHistory() {
        Decision d = new Decision();
        d.setId(99L);
        d.setTitle("Framework Decision");
        d.setCategory("Technology");
        d.setPollType("SINGLE_CHOICE");

        Option opt = new Option();
        opt.setId(505L);
        opt.setDecision(d);
        opt.setName("Spring Boot");

        Vote vote = new Vote(d, opt, testUser);
        vote.setId(1001L);
        vote.setRating(5);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(testUser));
        when(voteRepository.findByVoterIdOrderByCreatedAtDesc(42L)).thenReturn(List.of(vote));

        List<VotingHistoryResponse> history = userService.getVotingHistory("alice@example.com");
        assertEquals(1, history.size());
        VotingHistoryResponse entry = history.get(0);
        assertEquals(1001L, entry.getVoteId());
        assertEquals(99L, entry.getDecisionId());
        assertEquals("Framework Decision", entry.getDecisionTitle());
        assertEquals("Spring Boot", entry.getOptionTitle());
        assertEquals(5, entry.getRating());
    }
}
