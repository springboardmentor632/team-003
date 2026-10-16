package com.decisionhub.service;

import com.decisionhub.dto.ChangePasswordRequest;
import com.decisionhub.dto.UserProfileUpdateRequest;
import com.decisionhub.dto.VotingHistoryResponse;
import com.decisionhub.model.Decision;
import com.decisionhub.model.SavedDecision;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SavedDecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final SavedDecisionRepository savedDecisionRepository;
    private final VoteRepository voteRepository;
    private final DecisionRepository decisionRepository;
    private final DecisionService decisionService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       SavedDecisionRepository savedDecisionRepository,
                       VoteRepository voteRepository,
                       DecisionRepository decisionRepository,
                       DecisionService decisionService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.savedDecisionRepository = savedDecisionRepository;
        this.voteRepository = voteRepository;
        this.decisionRepository = decisionRepository;
        this.decisionService = decisionService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User getCurrentProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(String email, UserProfileUpdateRequest request) {
        User user = getCurrentProfile(email);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }

        return userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getCurrentProfile(email);

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Set<String> getInterests(String email) {
        User user = getCurrentProfile(email);
        return user.getInterests() != null ? user.getInterests() : Collections.emptySet();
    }

    public Set<String> updateInterests(String email, Set<String> interests) {
        User user = getCurrentProfile(email);
        user.setInterests(interests != null ? interests : new HashSet<>());
        User saved = userRepository.save(user);
        return saved.getInterests();
    }

    @Transactional(readOnly = true)
    public List<Decision> getSavedDecisions(String email) {
        User user = getCurrentProfile(email);
        List<SavedDecision> bookmarks = savedDecisionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return bookmarks.stream()
                .map(b -> decisionService.getDecisionById(b.getDecision().getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Long> getSavedDecisionIds(String email) {
        User user = getCurrentProfile(email);
        List<SavedDecision> bookmarks = savedDecisionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return bookmarks.stream()
                .map(b -> b.getDecision().getId())
                .collect(Collectors.toList());
    }

    public Map<String, Object> saveDecision(String email, Long decisionId) {
        User user = getCurrentProfile(email);
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new IllegalArgumentException("Decision board not found with id: " + decisionId));

        if (savedDecisionRepository.existsByUserIdAndDecisionId(user.getId(), decisionId)) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "SUCCESS");
            resp.put("saved", true);
            resp.put("message", "Decision is already saved");
            return resp;
        }

        savedDecisionRepository.save(new SavedDecision(user, decision));
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("saved", true);
        resp.put("message", "Decision bookmarked successfully");
        return resp;
    }

    public Map<String, Object> unsaveDecision(String email, Long decisionId) {
        User user = getCurrentProfile(email);
        savedDecisionRepository.deleteByUserIdAndDecisionId(user.getId(), decisionId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("saved", false);
        resp.put("message", "Decision bookmark removed");
        return resp;
    }

    @Transactional(readOnly = true)
    public List<VotingHistoryResponse> getVotingHistory(String email) {
        User user = getCurrentProfile(email);
        List<Vote> ballots = voteRepository.findByVoterIdOrderByCreatedAtDesc(user.getId());

        return ballots.stream().map(v -> new VotingHistoryResponse(
                v.getId(),
                v.getDecision() != null ? v.getDecision().getId() : null,
                v.getDecision() != null ? v.getDecision().getTitle() : null,
                v.getDecision() != null ? v.getDecision().getCategory() : null,
                v.getDecision() != null ? v.getDecision().getPollType() : null,
                v.getOption() != null ? v.getOption().getId() : null,
                v.getOption() != null ? v.getOption().getTitle() : null,
                v.getRating(),
                v.isAnonymous(),
                v.getCreatedAt()
        )).collect(Collectors.toList());
    }
}
