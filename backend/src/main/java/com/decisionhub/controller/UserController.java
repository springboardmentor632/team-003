package com.decisionhub.controller;

import com.decisionhub.dto.UpdateProfileRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse resp = userService.getProfile(email);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return getProfile();
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse resp = userService.updateProfile(email, request);
        return ResponseEntity.ok(resp);
    }
}
