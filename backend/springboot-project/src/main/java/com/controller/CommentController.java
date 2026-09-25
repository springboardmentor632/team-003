package com.decisionhub.controller;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.model.Comment;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommentService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/decisions/{decisionId}/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    private final CommentService comments; private final UserRepository users;
    public CommentController(CommentService comments, UserRepository users) { this.comments = comments; this.users = users; }
    @GetMapping public List<Comment> list(@PathVariable Long decisionId) { return comments.list(decisionId, current()); }
    @PostMapping public Comment create(@PathVariable Long decisionId, @RequestBody CommentRequest request) { return comments.create(decisionId, request, current()); }
    @PutMapping("/{commentId}") public Comment update(@PathVariable Long decisionId, @PathVariable Long commentId, @RequestBody CommentRequest request) { return comments.update(commentId, request, current()); }
    @PostMapping("/{commentId}/reactions") public Comment react(@PathVariable Long decisionId, @PathVariable Long commentId) { return comments.react(commentId, current()); }
    @DeleteMapping("/{commentId}") public ResponseEntity<Void> delete(@PathVariable Long decisionId, @PathVariable Long commentId) { comments.delete(commentId, current()); return ResponseEntity.noContent().build(); }
    @PutMapping("/{commentId}/hidden") public Comment hidden(@PathVariable Long decisionId, @PathVariable Long commentId, @RequestParam boolean value) { return comments.setHidden(commentId, value, current()); }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
