package com.controller;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.User;
import com.decisionhub.service.DiscussionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    // Get all discussions
    @GetMapping
    public ResponseEntity<List<Discussion>> getAllDiscussions() {
        return ResponseEntity.ok(
                discussionService.getAllDiscussions()
        );
    }

    // Get discussion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Discussion> getDiscussionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                discussionService.getDiscussionById(id)
        );
    }

    // Get discussions created by logged-in user
    @GetMapping("/mine")
    public ResponseEntity<List<Discussion>> getMyDiscussions(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                discussionService.getMyDiscussions(user)
        );
    }

    // Create discussion
    @PostMapping
    public ResponseEntity<Discussion> createDiscussion(
            @RequestParam String title,
            @RequestParam String content,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Discussion discussion =
                discussionService.createDiscussion(
                        title,
                        content,
                        user
                );

        return ResponseEntity.ok(discussion);
    }

    // Delete discussion
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscussion(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        discussionService.deleteDiscussion(id, user);

        return ResponseEntity.noContent().build();
    }
}