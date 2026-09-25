package com.controller;

import com.decisionhub.model.DiscussionComment;
import com.decisionhub.model.User;
import com.decisionhub.service.DiscussionCommentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions/{discussionId}/comments")
public class DiscussionCommentController {

    private final DiscussionCommentService commentService;

    public DiscussionCommentController(
            DiscussionCommentService commentService) {

        this.commentService = commentService;
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

        User user = (User) authentication.getPrincipal();

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

        User user = (User) authentication.getPrincipal();

        commentService.deleteComment(commentId, user);

        return ResponseEntity.noContent().build();
    }
}