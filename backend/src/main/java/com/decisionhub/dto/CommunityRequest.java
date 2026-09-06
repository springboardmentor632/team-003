package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;

public record CommunityRequest(@NotBlank String name, String description) {}