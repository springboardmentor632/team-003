package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateDecisionRequest(
        @NotBlank String title,
        String description,
        String category,
        String visibility,
        String votingType,
        @Size(min = 2, max = 10) List<@NotBlank String> options,
        String deadline
) {}