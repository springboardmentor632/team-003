package com.decisionhub.controller;

import com.decisionhub.dto.ReportRequest;
import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AuthorizationService;
import com.decisionhub.service.ReportService;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReportController {
    private final ReportService reports; private final UserRepository users; private final AuthorizationService authorization;
    public ReportController(ReportService reports, UserRepository users, AuthorizationService authorization) { this.reports = reports; this.users = users; this.authorization = authorization; }
    @PostMapping("/decisions/{decisionId}/reports") public Report create(@PathVariable Long decisionId, @RequestBody ReportRequest request) { return reports.create(decisionId, request, current()); }
    @GetMapping("/reports") public List<Report> list(@RequestParam(required = false) ReportStatus status) { User user = current(); authorization.requireAnyModerator(user); return reports.list(user, status); }
    @PutMapping("/reports/{id}") public Report resolve(@PathVariable Long id, @RequestParam ReportStatus status) { return reports.resolve(id, status, current()); }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
