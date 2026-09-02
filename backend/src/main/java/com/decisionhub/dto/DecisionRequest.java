package com.decisionhub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DecisionRequest(
    @NotBlank String title,
    String description,
    @NotBlank String category,
    @NotBlank String visibility,
    @NotBlank String pollType,
    boolean allowAnonymousVoting,
    @NotEmpty List<@Valid OptionRequest> options
) {
    public record OptionRequest(
        @NotBlank String title,
        String description,
        Integer costScore,
        Integer benefitsScore,
        Integer riskScore,
        Integer timeScore,
        Integer convenienceScore,
        String pros,
        String cons
    ) {}
}
