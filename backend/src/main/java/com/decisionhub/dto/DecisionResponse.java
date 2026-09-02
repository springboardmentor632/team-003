package com.decisionhub.dto;

import java.time.Instant;
import java.util.List;

public record DecisionResponse(Long id, String title, String description, String category, String visibility,
    String pollType, boolean allowAnonymousVoting, boolean closed, Instant createdAt, String createdByName,
    long totalVotes, List<OptionResponse> options) {
    public record OptionResponse(Long id, String title, String description, Integer costScore, Integer benefitsScore,
        Integer riskScore, Integer timeScore, Integer convenienceScore, String pros, String cons,
        long voteCount, Double averageRating, Double averageScore, int rank) {}
}
