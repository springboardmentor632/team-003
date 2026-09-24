package com.decisionhub.service;

import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.security.JwtService;
import com.decisionhub.service.PasswordResetEmailService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    @Test
    void registerUser_setsDefaultRole_whenRoleMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        PasswordResetTokenRepository passwordResetTokens = mock(PasswordResetTokenRepository.class);
        PasswordResetEmailService passwordResetEmailService = mock(PasswordResetEmailService.class);

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(10L);
            return user;
        });

        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtService,
                passwordResetTokens, passwordResetEmailService, 30);

        RegisterRequest request = new RegisterRequest();
        request.setName("Admin User");
        request.setEmail("admin@example.com");
        request.setPassword("secret123");
        request.setRole(null);

        User user = authService.registerUser(request);

        assertEquals("USER", user.getRole());
        verify(userRepository).save(any(User.class));
    }
}
