package com.decisionhub.service;

import com.decisionhub.model.Community;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.ReportRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReportServiceTest {
    private ReportRepository reports;
    private AuthorizationService authorization;
    private ReportService reportService;
    private Report report;
    private User moderator;
    private User member;

    @BeforeEach
    void setUp() {
        reports = mock(ReportRepository.class);
        DecisionRepository decisions = mock(DecisionRepository.class);
        CommentRepository comments = mock(CommentRepository.class);
        authorization = mock(AuthorizationService.class);
        reportService = new ReportService(reports, decisions, comments, authorization);

        User owner = user(1L, "Owner", "USER");
        moderator = user(2L, "Moderator", "USER");
        member = user(3L, "Member", "USER");
        Community community = new Community("Product Builders", "", owner);
        community.setId(10L);
        Decision decision = new Decision();
        decision.setId(20L);
        decision.setCommunity(community);
        report = new Report(member, decision, "Spam");
        report.setId(30L);
    }

    @Test
    void list_returnsReportsToCommunityModerator() {
        when(reports.findByStatusOrderByCreatedAtAsc(ReportStatus.PENDING)).thenReturn(List.of(report));
        when(authorization.isAdmin(moderator)).thenReturn(false);
        when(authorization.canModerate(report.getDecision(), moderator)).thenReturn(true);

        assertEquals(List.of(report), reportService.list(moderator, ReportStatus.PENDING));
    }

    @Test
    void list_hidesReportsFromUnrelatedMember() {
        when(reports.findByStatusOrderByCreatedAtAsc(ReportStatus.PENDING)).thenReturn(List.of(report));
        when(authorization.isAdmin(member)).thenReturn(false);
        when(authorization.canModerate(report.getDecision(), member)).thenReturn(false);

        assertEquals(List.of(), reportService.list(member, ReportStatus.PENDING));
    }

    @Test
    void resolve_allowsCommunityModeratorAndRejectsUnrelatedMember() {
        when(reports.findById(30L)).thenReturn(Optional.of(report));
        when(authorization.canModerate(report.getDecision(), moderator)).thenReturn(true);
        when(reports.save(report)).thenReturn(report);

        Report resolved = reportService.resolve(30L, ReportStatus.REVIEWED, moderator);

        assertEquals(ReportStatus.REVIEWED, resolved.getStatus());
        when(authorization.canModerate(report.getDecision(), member)).thenReturn(false);
        assertThrows(SecurityException.class, () -> reportService.resolve(30L, ReportStatus.DISMISSED, member));
    }

    private User user(Long id, String name, String role) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setRole(role);
        return user;
    }
}
