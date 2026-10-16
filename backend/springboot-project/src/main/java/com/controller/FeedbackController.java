package com.decisionhub.controller;

import com.decisionhub.dto.FeedbackRequest;
import com.decisionhub.model.Feedback;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.FeedbackService;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/feedback") @CrossOrigin(origins = "*")
public class FeedbackController {
    private final FeedbackService feedback; private final UserRepository users;
    public FeedbackController(FeedbackService feedback, UserRepository users) { this.feedback = feedback; this.users = users; }
    @PostMapping public Feedback create(@RequestBody FeedbackRequest request) { return feedback.create(request, current()); }
    @GetMapping public List<Feedback> mine() { return feedback.mine(current()); }
    @GetMapping("/all") public List<Feedback> all() { return feedback.all(current()); }
    @PutMapping("/{id}/status") public Feedback updateStatus(@PathVariable Long id, @RequestParam String status) { return feedback.updateStatus(id, status.toUpperCase(), current()); }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
