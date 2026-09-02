package com.decisionhub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(@NotNull Long optionId, @Min(1) @Max(5) Integer rating, boolean anonymous) {}
