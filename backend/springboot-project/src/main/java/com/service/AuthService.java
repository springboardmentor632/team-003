package com.decisionhub.service;

import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.LoginResponse;
import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.model.User;
import com.decisionhub.model.PasswordResetToken;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokens;
    private final PasswordResetEmailService passwordResetEmailService;
    private final long resetTokenTtlMinutes;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       PasswordResetTokenRepository passwordResetTokens,
                       PasswordResetEmailService passwordResetEmailService,
                       @Value("${app.password-reset.token-ttl-minutes:30}") long resetTokenTtlMinutes) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokens = passwordResetTokens;
        this.passwordResetEmailService = passwordResetEmailService;
        this.resetTokenTtlMinutes = resetTokenTtlMinutes;
    }

    // =========================
    // REGISTER
    // =========================
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("USER");

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================
    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    public LoginResponse registerAndLogin(RegisterRequest request) {
        User user = registerUser(request);
        return new LoginResponse(jwtService.generateToken(user.getEmail()), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional
    public void requestPasswordReset(String email) {
        // Deliberately return the same response when the address is unknown, preventing account enumeration.
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;

        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        passwordResetTokens.deleteByUserId(user.getId());
        passwordResetTokens.save(new PasswordResetToken(hash(rawToken), user,
                LocalDateTime.now().plusMinutes(resetTokenTtlMinutes)));
        passwordResetEmailService.send(user, rawToken);
    }

    @Transactional
    public void confirmPasswordReset(String token, String newPassword) {
        if (token == null || newPassword == null || newPassword.length() < 8) throw new IllegalArgumentException("A valid token and an 8-character password are required");
        PasswordResetToken resetToken = passwordResetTokens.findByTokenHashAndUsedAtIsNull(hash(token))
                .filter(value -> value.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Reset token is invalid or expired"));
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokens.save(resetToken);
    }

    private String hash(String token) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 is unavailable", error);
        }
    }
}
