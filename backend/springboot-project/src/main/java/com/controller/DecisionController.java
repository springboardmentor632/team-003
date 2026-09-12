package com.decisionhub.controller;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.DecisionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "*")
public class DecisionController {
    private final DecisionService decisions;
    private final UserRepository users;

    public DecisionController(DecisionService decisions, UserRepository users) {
        this.decisions = decisions;
        this.users = users;
    }

    @GetMapping("/public")
    public Page<Decision> publicBoards(@RequestParam(required = false) String category,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return decisions.publicDecisions(category, page(page, size));
    }

    @GetMapping("/mine")
    public Page<Decision> myBoards(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "20") int size) {
        return decisions.myDecisions(currentUser(), page(page, size));
    }

    @PostMapping({"", "/create"})
    public ResponseEntity<Decision> create(@RequestBody DecisionRequest request) {
        // The current user is resolved before delegation so board ownership is never client-controlled.
        return ResponseEntity.ok(decisions.createDecision(request, currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<Decision>> all() { return ResponseEntity.ok(decisions.getAllDecisions()); }

    @GetMapping("/{id}")
    public ResponseEntity<Decision> get(@PathVariable Long id) { return ResponseEntity.ok(decisions.getDecisionById(id)); }

    @PutMapping("/{id}")
    public ResponseEntity<Decision> update(@PathVariable Long id, @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(decisions.updateDecision(id, request, currentUser()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        decisions.deleteDecision(id, currentUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/options")
    public ResponseEntity<Option> addOption(@PathVariable Long id, @RequestBody OptionRequest request) {
        return ResponseEntity.ok(decisions.addOption(id, request, currentUser()));
    }

    @GetMapping("/{id}/options")
    public ResponseEntity<List<Option>> options(@PathVariable Long id) { return ResponseEntity.ok(decisions.getOptions(id)); }

    @PostMapping("/{id}/votes")
    public ResponseEntity<Decision> vote(@PathVariable Long id, @RequestBody VoteRequest request) {
        return ResponseEntity.ok(decisions.castVote(id, request, currentUser()));
    }

    @DeleteMapping("/{id}/votes/{optionId}")
    public ResponseEntity<Decision> retract(@PathVariable Long id, @PathVariable Long optionId) {
        return ResponseEntity.ok(decisions.retractVote(id, optionId, currentUser()));
    }

    @GetMapping("/{id}/votes/results")
    public ResponseEntity<Decision> results(@PathVariable Long id) { return ResponseEntity.ok(decisions.results(id)); }

    private PageRequest page(int page, int size) { return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("createdAt").descending()); }
    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
