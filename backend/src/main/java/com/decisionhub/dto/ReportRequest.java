package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReportRequest(@NotNull Long decisionId, Long commentId, @NotBlank String reason) {}