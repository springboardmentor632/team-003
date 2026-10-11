package com.decisionhub.controller;

import com.decisionhub.model.DiscussionComment;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.DiscussionCommentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions/{discussionId}/comments")
@CrossOrigin(origins = "*")
public class DiscussionCommentController {

    private final DiscussionCommentService commentService;
    private final UserRepository users;

    public DiscussionCommentController(
            DiscussionCommentService commentService,
            UserRepository users) {

        this.commentService = commentService;
        this.users = users;
    }

    // Get all comments and replies
    @GetMapping
    public ResponseEntity<List<DiscussionComment>> getComments(
            @PathVariable Long discussionId) {

        return ResponseEntity.ok(
                commentService.getComments(discussionId)
        );
    }

    // Add comment or reply
    @PostMapping
    public ResponseEntity<DiscussionComment> addComment(
            @PathVariable Long discussionId,
            @RequestParam String content,
            @RequestParam(required = false) Long parentCommentId,
            Authentication authentication) {

        User user = resolveUser(authentication);

        DiscussionComment comment =
                commentService.addComment(
                        discussionId,
                        content,
                        parentCommentId,
                        user
                );

        return ResponseEntity.ok(comment);
    }

    // Delete comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long discussionId,
            @PathVariable Long commentId,
            Authentication authentication) {

        User user = resolveUser(authentication);

        commentService.deleteComment(commentId, user);

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