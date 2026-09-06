package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {
    private final DecisionService service;

    public DecisionController(DecisionService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<DecisionResponse> create(@Valid @RequestBody CreateDecisionRequest request) {
        return ResponseEntity.status(201).body(service.create(request, email()));
    }

    @GetMapping
    public List<DecisionResponse> list() { return service.list(); }

    @GetMapping("/{id}")
    public DecisionResponse get(@PathVariable Long id) { return service.get(id); }

    @PostMapping("/{id}/votes")
    public ResponseEntity<Void> vote(@PathVariable Long id, @Valid @RequestBody VoteRequest request) {
        service.vote(id, request, email());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> comments(@PathVariable Long id) { return service.comments(id); }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> comment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(201).body(service.addComment(id, request, email()));
    }

    private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
}