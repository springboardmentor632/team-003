package com.decisionhub.controller;

import com.decisionhub.dto.ChangePasswordRequest;
import com.decisionhub.dto.UserInterestsRequest;
import com.decisionhub.dto.UserProfileUpdateRequest;
import com.decisionhub.dto.VotingHistoryResponse;
import com.decisionhub.model.Decision;
import com.decisionhub.model.User;
import com.decisionhub.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getCurrentProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(Authentication authentication,
                                              @RequestBody UserProfileUpdateRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication,
                                                              @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Password changed successfully"));
    }

    @GetMapping("/me/interests")
    public ResponseEntity<Set<String>> getInterests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getInterests(email));
    }

    @PutMapping("/me/interests")
    public ResponseEntity<Set<String>> updateInterests(Authentication authentication,
                                                       @RequestBody UserInterestsRequest request) {
        String email = authentication.getName();
        Set<String> updated = userService.updateInterests(email, request.getInterests());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/me/saved-decisions")
    public ResponseEntity<List<Decision>> getSavedDecisions(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getSavedDecisions(email));
    }

    @GetMapping("/me/saved-decisions/ids")
    public ResponseEntity<List<Long>> getSavedDecisionIds(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getSavedDecisionIds(email));
    }

    @PostMapping("/me/saved-decisions/{decisionId}")
    public ResponseEntity<Map<String, Object>> saveDecision(Authentication authentication,
                                                            @PathVariable Long decisionId) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.saveDecision(email, decisionId));
    }

    @DeleteMapping("/me/saved-decisions/{decisionId}")
    public ResponseEntity<Map<String, Object>> unsaveDecision(Authentication authentication,
                                                              @PathVariable Long decisionId) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.unsaveDecision(email, decisionId));
    }

    @GetMapping("/me/votes")
    public ResponseEntity<List<VotingHistoryResponse>> getVotingHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getVotingHistory(email));
    }
}
