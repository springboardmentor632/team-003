package com.decisionhub.controller;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.DiscussionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
@CrossOrigin(origins = "*")
public class DiscussionController {

    private final DiscussionService discussionService;
    private final UserRepository users;

    public DiscussionController(DiscussionService discussionService, UserRepository users) {
        this.discussionService = discussionService;
        this.users = users;
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

        User user = resolveUser(authentication);

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

        User user = resolveUser(authentication);

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

        User user = resolveUser(authentication);

        discussionService.deleteDiscussion(id, user);

        return ResponseEntity.noContent().build();
    }

    private User resolveUser(Authentication authentication) {
        Authentication auth = authentication != null ? authentication : SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        String email = auth != null ? auth.getName() : null;
        return users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}