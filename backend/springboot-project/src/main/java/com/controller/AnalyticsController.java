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
        Map<String, Long> optionPopularity = new LinkedHashMap<>();
        Map<String, Long> communityActivity = new LinkedHashMap<>();
        Map<String, Long> decisionTrends = new LinkedHashMap<>();
        for (Decision decision : visible) {
            categoryVotes.merge(decision.getCategory(), decision.getTotalVotes(), Long::sum);
            pollTypes.merge(decision.getPollType(), 1L, Long::sum);
            decision.getOptions().forEach(option -> optionPopularity.merge(option.getTitle(), option.getVoteCount(), Long::sum));
            communityActivity.merge(decision.getCommunity() == null ? "Independent boards" : decision.getCommunity().getName(), decision.getTotalVotes(), Long::sum);
            decisionTrends.merge(decision.getCreatedAt() == null ? "Unknown" : decision.getCreatedAt().toLocalDate().toString(), 1L, Long::sum);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBoards", visible.size()); result.put("totalVotes", totalVotes);
        result.put("boardsWithVotes", visible.stream().filter(d -> d.getTotalVotes() > 0).count());
        result.put("closedBoards", visible.stream().filter(Decision::isClosed).count());
        result.put("categoryVotes", categoryVotes); result.put("pollTypes", pollTypes);
        result.put("optionPopularity", optionPopularity); result.put("communityActivity", communityActivity);
        result.put("decisionTrends", decisionTrends);
        result.put("outcomes", Map.of("open", visible.stream().filter(d -> !d.isClosed()).count(), "closed", visible.stream().filter(Decision::isClosed).count()));
        result.put("mostActive", visible.stream().sorted(Comparator.comparingLong(Decision::getTotalVotes).reversed()).limit(5).toList());
        return result;
    }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
