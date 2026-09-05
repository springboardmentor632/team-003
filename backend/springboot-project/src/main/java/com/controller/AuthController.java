package com.decisionhub.controller;

import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.LoginResponse;
import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.model.User;
import com.decisionhub.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody RegisterRequest request) {

        User user = authService.registerUser(request);

        return ResponseEntity.ok(user);
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.loginUser(request);

        return ResponseEntity.ok(response);
    }
}