package com.decisionhub.controller;

import com.decisionhub.model.Decision;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.DecisionService;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    private final DecisionService decisions; private final UserRepository users;
    public AnalyticsController(DecisionService decisions, UserRepository users) { this.decisions = decisions; this.users = users; }
    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<Decision> visible = decisions.analyticsVisibleTo(current());
        long totalVotes = visible.stream().mapToLong(Decision::getTotalVotes).sum();
        Map<String, Long> categoryVotes = new LinkedHashMap<>();
        Map<String, Long> pollTypes = new LinkedHashMap<>();
        for (Decision decision : visible) {
            categoryVotes.merge(decision.getCategory(), decision.getTotalVotes(), Long::sum);
            pollTypes.merge(decision.getPollType(), 1L, Long::sum);
        }
        return Map.of(
            "totalBoards", visible.size(),
            "totalVotes", totalVotes,
            "boardsWithVotes", visible.stream().filter(d -> d.getTotalVotes() > 0).count(),
            "closedBoards", visible.stream().filter(Decision::isClosed).count(),
            "categoryVotes", categoryVotes,
            "pollTypes", pollTypes,
            "mostActive", visible.stream().sorted(Comparator.comparingLong(Decision::getTotalVotes).reversed()).limit(5).toList());
    }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
