package com.decisionhub.service;

import com.decisionhub.dto.FeedbackRequest;
import com.decisionhub.model.Feedback;
import com.decisionhub.model.User;
import com.decisionhub.repository.FeedbackRepository;
import com.decisionhub.repository.DecisionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository feedback; private final DecisionRepository decisions;
    public FeedbackService(FeedbackRepository feedback, DecisionRepository decisions) { this.feedback = feedback; this.decisions = decisions; }
    @Transactional public Feedback create(FeedbackRequest request, User author) {
        if (request.getMessage() == null || request.getMessage().isBlank()) throw new IllegalArgumentException("Feedback message is required");
        Feedback entry = new Feedback(request.getMessage().trim(), author);
        if (request.getDecisionId() != null) entry.setDecision(decisions.findById(request.getDecisionId()).orElseThrow(() -> new IllegalArgumentException("Decision not found")));
        return feedback.save(entry);
    }
    @Transactional(readOnly = true) public List<Feedback> mine(User user) { return feedback.findByAuthorIdOrderByCreatedAtDesc(user.getId()); }
    @Transactional(readOnly = true) public List<Feedback> all(User user) {
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) throw new SecurityException("Admin access is required");
        return feedback.findAllByOrderByCreatedAtDesc();
    }
    @Transactional public Feedback updateStatus(Long id, String status, User user) {
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) throw new SecurityException("Admin access is required");
        if (!java.util.Set.of("OPEN", "REVIEWED", "RESOLVED").contains(status)) throw new IllegalArgumentException("Invalid feedback status");
        Feedback entry = feedback.findById(id).orElseThrow(() -> new IllegalArgumentException("Feedback not found")); entry.setStatus(status); return feedback.save(entry);
    }
}
