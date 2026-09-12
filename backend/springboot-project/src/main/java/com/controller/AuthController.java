package com.decisionhub.controller;

import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.LoginResponse;
import com.decisionhub.dto.PasswordResetConfirmRequest;
import com.decisionhub.dto.PasswordResetRequest;
import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AuthService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;
    public AuthController(AuthService auth, UserRepository users) { this.auth = auth; this.users = users; }

    @PostMapping("/auth/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) { return ResponseEntity.ok(auth.registerAndLogin(request)); }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) { return ResponseEntity.ok(auth.loginUser(request)); }

    @GetMapping("/auth/demo-admin")
    public ResponseEntity<LoginResponse> demoAdmin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@decisionhub.local");
        request.setPassword("admin123");
        return ResponseEntity.ok(auth.loginUser(request));
    }

    @PostMapping("/auth/password-reset/request")
    public Map<String, String> requestReset(@RequestBody PasswordResetRequest request) {
        auth.requestPasswordReset(request.getEmail());
        return Map.of("message", "If an account exists for that email, a password-reset link has been sent.");
    }

    @PostMapping("/auth/password-reset/confirm")
    public Map<String, String> confirmReset(@RequestBody PasswordResetConfirmRequest request) {
        auth.confirmPasswordReset(request.getToken(), request.getNewPassword());
        return Map.of("message", "Password updated");
    }

    @GetMapping("/users/me")
    public User me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
