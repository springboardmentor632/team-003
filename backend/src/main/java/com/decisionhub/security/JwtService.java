package com.decisionhub.security;

public interface JwtService {
    String generateToken(String email, String role);
    boolean validateToken(String token);
    String extractEmail(String token);
}
