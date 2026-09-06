package com.decisionhub.dto;

import java.time.Instant;

public record UserResponse(Long id, String name, String email, String role, Instant createdAt, Instant updatedAt) {}
