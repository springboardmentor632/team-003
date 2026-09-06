package com.decisionhub.service.impl;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.*;
import com.decisionhub.service.DecisionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class DecisionServiceImpl implements DecisionService {
    private final DecisionRepository decisions;
    private final DecisionOptionRepository options;
    private final UserRepository users;
    private final VoteRepository votes;
    private final CommentRepository comments;

    public DecisionServiceImpl(DecisionRepository decisions, DecisionOptionRepository options,
                               UserRepository users, VoteRepository votes, CommentRepository comments) {
        this.decisions = decisions;
        this.options = options;
        this.users = users;
        this.votes = votes;
        this.comments = comments;
    }

    @Override
    @Transactional
    public DecisionResponse create(CreateDecisionRequest request, String email) {
        User creator = user(email);
        Decision decision = new Decision(request.title(), request.description(), creator);
        decision.setCategory(request.category());
        decision.setVisibility(request.visibility() == null || request.visibility().isBlank() ? "public" : request.visibility());
        decision.setVotingType(request.votingType() == null || request.votingType().isBlank() ? "single" : request.votingType());
        if (request.deadline() != null && !request.deadline().isBlank()) {
            decision.setDeadline(LocalDate.parse(request.deadline()).atStartOfDay().toInstant(ZoneOffset.UTC));
        }
        request.options().forEach(label -> decision.getOptions().add(new DecisionOption(label, decision)));
        return response(decisions.save(decision));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DecisionResponse> list() {
        return decisions.findAll().stream().map(this::response).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DecisionResponse get(Long id) { return response(decision(id)); }

    @Override
    @Transactional
    public void vote(Long id, VoteRequest request, String email) {
        Decision decision = decision(id);
        User voter = user(email);
        DecisionOption option = options.findById(request.optionId())
                .orElseThrow(() -> new ResourceNotFoundException("Option not found"));
        if (!option.getDecision().getId().equals(decision.getId())) {
            throw new ResourceNotFoundException("Option does not belong to decision");
        }
        if (votes.existsByDecisionIdAndVoterId(id, voter.getId())) {
            throw new IllegalStateException("User has already voted on this decision");
        }
        votes.save(new Vote(decision, option, voter));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> comments(Long id) {
        decision(id);
        return comments.findByDecisionIdOrderByCreatedAtAsc(id).stream()
                .map(comment -> new CommentResponse(comment.getId(), comment.getContent(), comment.getAuthor().getName(), comment.getCreatedAt())).toList();
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long id, CommentRequest request, String email) {
        Comment comment = new Comment(request.content(), decision(id), user(email));
        comment = comments.save(comment);
        return new CommentResponse(comment.getId(), comment.getContent(), comment.getAuthor().getName(), comment.getCreatedAt());
    }

    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private Decision decision(Long id) { return decisions.findById(id).orElseThrow(() -> new ResourceNotFoundException("Decision not found")); }
    private DecisionResponse response(Decision decision) {
        List<DecisionResponse.OptionResponse> optionResponses = decision.getOptions().stream()
                .map(option -> new DecisionResponse.OptionResponse(option.getId(), option.getLabel(), votes.countByOptionId(option.getId()))).toList();
        return new DecisionResponse(decision.getId(), decision.getTitle(), decision.getDescription(), decision.getCategory(),
                decision.getVisibility(), decision.getVotingType(), decision.getStatus(), decision.getDeadline(),
                decision.getCreator().getName(), optionResponses, decision.getCreatedAt(), decision.getUpdatedAt());
    }
}