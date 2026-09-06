package com.decisionhub.dto;

import com.decisionhub.entity.DecisionStatus;
import java.time.Instant;
import java.util.List;

public record DecisionResponse(
        Long id, String title, String description, String category, String visibility,
        String votingType, DecisionStatus status, Instant deadline, String creatorName,
        List<OptionResponse> options, Instant createdAt, Instant updatedAt
) {
    public record OptionResponse(Long id, String label, long voteCount) {}
}