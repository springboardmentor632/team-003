package com.decisionhub.controller;

import com.decisionhub.dto.SuggestionRequest;
import com.decisionhub.model.Suggestion;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.SuggestionService;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/decisions/{decisionId}/suggestions") @CrossOrigin(origins = "*")
public class SuggestionController {
    private final SuggestionService suggestions; private final UserRepository users;
    public SuggestionController(SuggestionService suggestions, UserRepository users) { this.suggestions = suggestions; this.users = users; }
    @GetMapping public List<Suggestion> list(@PathVariable Long decisionId) { return suggestions.list(decisionId); }
    @PostMapping public Suggestion create(@PathVariable Long decisionId, @RequestBody SuggestionRequest request) { return suggestions.create(decisionId, request, current()); }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
