package com.decisionhub.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceImplTest {

    private JwtServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new JwtServiceImpl();
        ReflectionTestUtils.setField(service, "jwtSecret", "a-secret-key-that-is-at-least-32-bytes-long");
        ReflectionTestUtils.setField(service, "jwtExpirationMs", 60_000L);
        service.init();
    }

    @Test
    void generatedTokenContainsEmailAndValidates() {
        String token = service.generateToken("user@example.com", "USER");

        assertTrue(service.validateToken(token));
        assertEquals("user@example.com", service.extractEmail(token));
    }

    @Test
    void malformedTokenDoesNotValidate() {
        assertFalse(service.validateToken("not-a-jwt"));
    }

    @Test
    void tokenSignedWithDifferentSecretDoesNotValidate() {
        JwtServiceImpl other = new JwtServiceImpl();
        ReflectionTestUtils.setField(other, "jwtSecret", "another-secret-key-that-is-at-least-32-bytes");
        ReflectionTestUtils.setField(other, "jwtExpirationMs", 60_000L);
        other.init();

        assertFalse(service.validateToken(other.generateToken("user@example.com", "USER")));
    }
}