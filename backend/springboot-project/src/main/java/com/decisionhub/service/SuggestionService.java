package com.decisionhub.service;

import com.decisionhub.dto.SuggestionRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Suggestion;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SuggestionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuggestionService {
    private final SuggestionRepository suggestions; private final DecisionRepository decisions;
    public SuggestionService(SuggestionRepository suggestions, DecisionRepository decisions) { this.suggestions = suggestions; this.decisions = decisions; }
    @Transactional(readOnly = true) public List<Suggestion> list(Long decisionId) { return suggestions.findByDecisionIdOrderByCreatedAtDesc(decisionId); }
    @Transactional public Suggestion create(Long decisionId, SuggestionRequest request, User author) {
        if (request.getContent() == null || request.getContent().isBlank()) throw new IllegalArgumentException("Suggestion text is required");
        Decision decision = decisions.findById(decisionId).orElseThrow(() -> new IllegalArgumentException("Decision not found"));
        return suggestions.save(new Suggestion(request.getContent().trim(), decision, author));
    }
}
