package com.decisionhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/users")
    public ResponseEntity<String> listUsers() {
        // Will be implemented to return user list for ADMIN only
        return ResponseEntity.ok("Not implemented yet");
    }
}
