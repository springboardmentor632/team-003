package com.decisionhub.controller;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.DecisionService;
import java.time.LocalDate;
import java.util.ArrayList;
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

    private final DecisionService decisions;
    private final UserRepository users;
    private final VoteRepository votes;

    public AnalyticsController(
            DecisionService decisions,
            UserRepository users,
            VoteRepository votes) {
        this.decisions = decisions;
        this.users = users;
        this.votes = votes;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<Decision> visible = visibleDecisions();

        long totalVotes = visible.stream()
                .mapToLong(Decision::getTotalVotes)
                .sum();

        Map<String, Long> categoryVotes = new LinkedHashMap<>();
        Map<String, Long> pollTypes = new LinkedHashMap<>();

        for (Decision decision : visible) {
            categoryVotes.merge(
                    safe(decision.getCategory(), "General"),
                    decision.getTotalVotes(),
                    Long::sum);

            pollTypes.merge(
                    safe(decision.getPollType(), "UNKNOWN"),
                    1L,
                    Long::sum);
        }

        Map<String, Long> optionPopularity = new LinkedHashMap<>();
        Map<String, Long> communityActivity = new LinkedHashMap<>();
        Map<String, Long> decisionTrends = new LinkedHashMap<>();

        for (Decision decision : visible) {
            decision.getOptions().forEach(option ->
                    optionPopularity.merge(
                            option.getTitle(),
                            option.getVoteCount(),
                            Long::sum));

            communityActivity.merge(
                    decision.getCommunity() == null
                            ? "Independent boards"
                            : decision.getCommunity().getName(),
                    decision.getTotalVotes(),
                    Long::sum);

            decisionTrends.merge(
                    decision.getCreatedAt() == null
                            ? "Unknown"
                            : decision.getCreatedAt().toLocalDate().toString(),
                    1L,
                    Long::sum);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalBoards", visible.size());
        result.put("totalVotes", totalVotes);
        result.put(
                "boardsWithVotes",
                visible.stream()
                        .filter(d -> d.getTotalVotes() > 0)
                        .count());
        result.put(
                "closedBoards",
                visible.stream()
                        .filter(Decision::isClosed)
                        .count());
        result.put("categoryVotes", categoryVotes);
        result.put("pollTypes", pollTypes);
        result.put("optionPopularity", optionPopularity);
        result.put("communityActivity", communityActivity);
        result.put("decisionTrends", decisionTrends);
        result.put(
                "outcomes",
                Map.of(
                        "open",
                        visible.stream()
                                .filter(d -> !d.isClosed())
                                .count(),
                        "closed",
                        visible.stream()
                                .filter(Decision::isClosed)
                                .count()));
        result.put(
                "mostActive",
                visible.stream()
                        .sorted(
                                Comparator.comparingLong(
                                        Decision::getTotalVotes)
                                        .reversed())
                        .limit(5)
                        .toList());

        return result;
    }

    @GetMapping("/vote-distribution")
    public List<Map<String, Object>> voteDistribution() {
        List<Map<String, Object>> result = new ArrayList<>();

        for (Decision decision : visibleDecisions()) {
            List<Vote> decisionVotes =
                    votes.findByDecisionId(decision.getId());

            Map<Long, Long> counts = new LinkedHashMap<>();

            for (Vote vote : decisionVotes) {
                if (vote.getOption() != null
                        && vote.getOption().getId() != null) {
                    counts.merge(
                            vote.getOption().getId(),
                            1L,
                            Long::sum);
                }
            }

            long total = decisionVotes.size();

            for (Option option : decision.getOptions()) {
                long count =
                        counts.getOrDefault(option.getId(), 0L);

                double percentage = total == 0
                        ? 0.0
                        : Math.round(
                                (count * 10000.0) / total)
                                / 100.0;

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("decisionId", decision.getId());
                row.put("decisionTitle", decision.getTitle());
                row.put("optionId", option.getId());
                row.put("optionName", option.getName());
                row.put("voteCount", count);
                row.put("percentage", percentage);

                result.add(row);
            }
        }

        return result;
    }

    @GetMapping("/option-popularity")
    public List<Map<String, Object>> optionPopularity() {
        List<Map<String, Object>> result = new ArrayList<>();

        for (Decision decision : visibleDecisions()) {
            List<Vote> decisionVotes =
                    votes.findByDecisionId(decision.getId());

            Map<Long, Long> counts = new LinkedHashMap<>();

            for (Vote vote : decisionVotes) {
                if (vote.getOption() != null
                        && vote.getOption().getId() != null) {
                    counts.merge(
                            vote.getOption().getId(),
                            1L,
                            Long::sum);
                }
            }

            for (Option option : decision.getOptions()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("decisionId", decision.getId());
                row.put("decisionTitle", decision.getTitle());
                row.put("optionId", option.getId());
                row.put("optionName", option.getName());
                row.put(
                        "voteCount",
                        counts.getOrDefault(option.getId(), 0L));

                result.add(row);
            }
        }

        result.sort(
                Comparator.comparingLong(
                        (Map<String, Object> row) ->
                                -((Number) row.get("voteCount"))
                                        .longValue()));

        return result;
    }

    @GetMapping("/participation")
    public List<Map<String, Object>> participation() {
        List<Decision> visible = visibleDecisions();

        long totalVotes = visible.stream()
                .mapToLong(Decision::getTotalVotes)
                .sum();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Decision decision : visible) {
            long decisionVotes = decision.getTotalVotes();

            double participationPercentage = totalVotes == 0
                    ? 0.0
                    : Math.round(
                            (decisionVotes * 10000.0)
                                    / totalVotes)
                            / 100.0;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("decisionId", decision.getId());
            row.put("decisionTitle", decision.getTitle());
            row.put("totalVotes", decisionVotes);
            row.put(
                    "participationPercentage",
                    participationPercentage);

            result.add(row);
        }

        result.sort(
                Comparator.comparingLong(
                        (Map<String, Object> row) ->
                                -((Number) row.get("totalVotes"))
                                        .longValue()));

        return result;
    }

    @GetMapping("/decision-trends")
    public List<Map<String, Object>> decisionTrends() {
        Map<LocalDate, Long> trendMap = new LinkedHashMap<>();

        for (Decision decision : visibleDecisions()) {
            if (decision.getCreatedAt() == null) {
                continue;
            }

            LocalDate date =
                    decision.getCreatedAt().toLocalDate();

            trendMap.merge(
                    date,
                    1L,
                    Long::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();

        trendMap.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    Map<String, Object> row =
                            new LinkedHashMap<>();

                    row.put(
                            "date",
                            entry.getKey().toString());

                    row.put(
                            "decisionsCreated",
                            entry.getValue());

                    result.add(row);
                });

        return result;
    }

    @GetMapping("/community-activity")
    public List<Map<String, Object>> communityActivity() {
        Map<Long, Long> decisionCounts =
                new LinkedHashMap<>();

        Map<Long, Long> voteCounts =
                new LinkedHashMap<>();

        for (Decision decision : visibleDecisions()) {
            Long communityId =
                    decision.getCommunityId();

            if (communityId == null) {
                communityId = 0L;
            }

            decisionCounts.merge(
                    communityId,
                    1L,
                    Long::sum);

            voteCounts.merge(
                    communityId,
                    decision.getTotalVotes(),
                    Long::sum);
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Long communityId : decisionCounts.keySet()) {
            Map<String, Object> row =
                    new LinkedHashMap<>();

            row.put(
                    "communityId",
                    communityId);

            row.put(
                    "decisionCount",
                    decisionCounts.getOrDefault(
                            communityId,
                            0L));

            row.put(
                    "voteCount",
                    voteCounts.getOrDefault(
                            communityId,
                            0L));

            result.add(row);
        }

        result.sort(
                Comparator.comparingLong(
                        (Map<String, Object> row) ->
                                -((Number) row.get("voteCount"))
                                        .longValue()));

        return result;
    }

    private List<Decision> visibleDecisions() {
        return decisions.analyticsVisibleTo(current());
    }

    private User current() {
        return users.findByEmail(
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName()
        ).orElseThrow(
                () -> new IllegalArgumentException(
                        "User not found"));
    }

    private String safe(
            String value,
            String fallback) {
        return value == null || value.isBlank()
                ? fallback
                : value;
    }
}