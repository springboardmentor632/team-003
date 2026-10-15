package com.decisionhub.service;

import com.decisionhub.dto.ReportRequest;
import com.decisionhub.model.Comment;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.service.AuthorizationService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {
    private final ReportRepository reports; private final DecisionRepository decisions; private final CommentRepository comments; private final AuthorizationService authorization;
    public ReportService(ReportRepository reports, DecisionRepository decisions, CommentRepository comments, AuthorizationService authorization) { this.reports = reports; this.decisions = decisions; this.comments = comments; this.authorization = authorization; }
    @Transactional
    public Report create(Long decisionId, ReportRequest request, User reporter) {
        if (request.getReason() == null || request.getReason().isBlank()) throw new IllegalArgumentException("A report reason is required");
        Decision decision = decisions.findById(decisionId).orElseThrow(() -> new IllegalArgumentException("Decision not found"));
        Report report = new Report(reporter, decision, request.getReason().trim());
        if (request.getCommentId() != null) {
            Comment comment = comments.findById(request.getCommentId()).orElseThrow(() -> new IllegalArgumentException("Comment not found"));
            report.setComment(comment);
        }
        return reports.save(report);
    }
    @Transactional(readOnly = true)
    public List<Report> list(User user, ReportStatus status) {
        List<Report> all = status == null ? reports.findAll() : reports.findByStatusOrderByCreatedAtAsc(status);
        if (authorization.isAdmin(user)) return all;
        return all.stream().filter(report -> authorization.canModerate(report.getDecision(), user)).toList();
    }
    @Transactional
    public Report resolve(Long id, ReportStatus status, User user) {
        Report report = reports.findById(id).orElseThrow(() -> new IllegalArgumentException("Report not found"));
        if (!authorization.canModerate(report.getDecision(), user)) throw new SecurityException("A community moderator or admin is required");
        report.setStatus(status);
        return reports.save(report);
    }
    private void admin(User user) { if (!"ADMIN".equalsIgnoreCase(user.getRole())) throw new SecurityException("Admin access is required"); }
}
