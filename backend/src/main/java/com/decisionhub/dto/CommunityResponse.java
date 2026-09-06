package com.decisionhub.dto;

import java.time.Instant;

public record CommunityResponse(Long id, String name, String description, String ownerName, Instant createdAt) {}