package com.decisionhub.controller;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.service.DecisionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "*")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Decision> createDecision(
            @RequestBody DecisionRequest request) {

        return ResponseEntity.ok(
                decisionService.createDecision(request)
        );
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Decision>> getAllDecisions() {

        return ResponseEntity.ok(
                decisionService.getAllDecisions()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Decision> getDecisionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                decisionService.getDecisionById(id)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Decision> updateDecision(
            @PathVariable Long id,
            @RequestBody DecisionRequest request) {

        return ResponseEntity.ok(
                decisionService.updateDecision(id, request)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDecision(
            @PathVariable Long id) {

        decisionService.deleteDecision(id);

        return ResponseEntity.ok(
                "Decision deleted successfully"
        );
    }

    // ADD OPTION
    @PostMapping("/{id}/options")
    public ResponseEntity<Option> addOption(
            @PathVariable Long id,
            @RequestBody OptionRequest request) {

        return ResponseEntity.ok(
                decisionService.addOption(id, request)
        );
    }

    // GET OPTIONS
    @GetMapping("/{id}/options")
    public ResponseEntity<List<Option>> getOptions(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                decisionService.getOptions(id)
        );
    }
}