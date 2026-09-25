package com.decisionhub.service;

import com.decisionhub.dto.FeedbackRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Feedback;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.FeedbackRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FeedbackServiceTest {
    private FeedbackRepository feedback;
    private DecisionRepository decisions;
    private FeedbackService feedbackService;
    private User author;
    private User admin;

    @BeforeEach
    void setUp() {
        feedback = mock(FeedbackRepository.class);
        decisions = mock(DecisionRepository.class);
        feedbackService = new FeedbackService(feedback, decisions);
        author = user(1L, "USER");
        admin = user(2L, "ADMIN");
    }

    @Test
    void create_rejectsBlankMessage() {
        FeedbackRequest request = new FeedbackRequest();
        request.setMessage("  ");

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> feedbackService.create(request, author));

        assertEquals("Feedback message is required", error.getMessage());
    }

    @Test
    void create_trimsMessageAndAssociatesDecision() {
        Decision decision = new Decision();
        decision.setId(12L);
        FeedbackRequest request = new FeedbackRequest();
        request.setMessage("  Improve the discussion flow  ");
        request.setDecisionId(12L);
        when(decisions.findById(12L)).thenReturn(Optional.of(decision));
        when(feedback.save(any(Feedback.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Feedback result = feedbackService.create(request, author);

        assertEquals("Improve the discussion flow", result.getMessage());
        assertEquals(decision, result.getDecision());
        assertEquals("OPEN", result.getStatus());
        verify(feedback).save(any(Feedback.class));
    }

    @Test
    void create_rejectsUnknownDecision() {
        FeedbackRequest request = new FeedbackRequest();
        request.setMessage("Related feedback");
        request.setDecisionId(99L);
        when(decisions.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> feedbackService.create(request, author));

        assertEquals("Decision not found", error.getMessage());
    }

    @Test
    void mine_returnsFeedbackForCurrentAuthor() {
        Feedback entry = new Feedback("My feedback", author);
        when(feedback.findByAuthorIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(entry));

        assertEquals(List.of(entry), feedbackService.mine(author));
        verify(feedback).findByAuthorIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void all_requiresAdminRole() {
        assertThrows(SecurityException.class, () -> feedbackService.all(author));
    }

    @Test
    void updateStatus_requiresValidStatusAndAdminRole() {
        Feedback entry = new Feedback("Needs review", author);
        entry.setId(7L);
        when(feedback.findById(7L)).thenReturn(Optional.of(entry));
        when(feedback.save(entry)).thenReturn(entry);

        Feedback updated = feedbackService.updateStatus(7L, "REVIEWED", admin);

        assertEquals("REVIEWED", updated.getStatus());
        assertThrows(IllegalArgumentException.class, () -> feedbackService.updateStatus(7L, "INVALID", admin));
        assertThrows(SecurityException.class, () -> feedbackService.updateStatus(7L, "RESOLVED", author));
    }

    private User user(Long id, String role) {
        User user = new User();
        user.setId(id);
        user.setName(role + " User");
        user.setEmail(role.toLowerCase() + "@example.com");
        user.setRole(role);
        return user;
    }
}
