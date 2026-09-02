package com.decisionhub.controller;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {
    private final DecisionService service;
    public DecisionController(DecisionService service) { this.service = service; }

    private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
    private PageRequest page(int page, int size) { return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)); }

    @PostMapping
    public ResponseEntity<DecisionResponse> create(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.status(201).body(service.create(email(), request));
    }

    @GetMapping("/public")
    public Page<DecisionResponse> publicDecisions(@RequestParam(required = false) String category,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return service.publicDecisions(category, page(page, size));
    }

    @GetMapping("/mine")
    public Page<DecisionResponse> mine(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return service.myDecisions(email(), page(page, size));
    }

    @GetMapping("/{id}")
    public DecisionResponse get(@PathVariable Long id) { return service.get(id, email()); }

    @PutMapping("/{id}")
    public DecisionResponse update(@PathVariable Long id, @Valid @RequestBody DecisionRequest request) { return service.update(id, email(), request); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id, email()); return ResponseEntity.noContent().build(); }

    @PostMapping("/{id}/options")
    public DecisionResponse addOption(@PathVariable Long id, @Valid @RequestBody DecisionRequest.OptionRequest request) {
        return service.addOption(id, email(), request);
    }

    @PostMapping("/{id}/votes")
    public DecisionResponse vote(@PathVariable Long id, @Valid @RequestBody VoteRequest request) { return service.vote(id, email(), request); }

    @DeleteMapping("/{id}/votes/{optionId}")
    public DecisionResponse retract(@PathVariable Long id, @PathVariable Long optionId) { return service.retract(id, email(), optionId); }

    @GetMapping("/{id}/votes/results")
    public DecisionResponse results(@PathVariable Long id) { return service.get(id, email()); }
}
