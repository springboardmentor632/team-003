package com.decisionhub.controller;

import com.decisionhub.dto.CommunityRequest;
import com.decisionhub.dto.CommunityResponse;
import com.decisionhub.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {
    private final CommunityService service;

    public CommunityController(CommunityService service) { this.service = service; }

    @GetMapping
    public List<CommunityResponse> list() { return service.list(); }

    @PostMapping
    public ResponseEntity<CommunityResponse> create(@Valid @RequestBody CommunityRequest request) {
        return ResponseEntity.status(201).body(service.create(request, email()));
    }

    private String email() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
}