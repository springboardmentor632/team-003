package com.decisionhub.controller;

import com.decisionhub.dto.ReportRequest;
import com.decisionhub.entity.Report;
import com.decisionhub.entity.ReportStatus;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportRepository reports;
    private final UserRepository users;
    private final DecisionRepository decisions;
    private final CommentRepository comments;

    public ReportController(ReportRepository reports, UserRepository users, DecisionRepository decisions, CommentRepository comments) {
        this.reports = reports;
        this.users = users;
        this.decisions = decisions;
        this.comments = comments;
    }

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody ReportRequest request) {
        Report report = new Report(
                users.findByEmail(email()).orElseThrow(() -> new ResourceNotFoundException("User not found")),
                decisions.findById(request.decisionId()).orElseThrow(() -> new ResourceNotFoundException("Decision not found")),
                request.reason());
        if (request.commentId() != null) report.setComment(comments.findById(request.commentId())
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found")));
        reports.save(report);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam ReportStatus status) {
        Report report = reports.findById(id).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus(status);
        reports.save(report);
        return ResponseEntity.noContent().build();
    }

    private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
}