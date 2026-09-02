package com.decisionhub.service.impl;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionOption;
import com.decisionhub.entity.User;
import com.decisionhub.entity.Vote;
import com.decisionhub.exception.BadRequestException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.DecisionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class DecisionServiceImpl implements DecisionService {
    private final DecisionRepository decisions;
    private final VoteRepository votes;
    private final UserRepository users;

    public DecisionServiceImpl(DecisionRepository decisions, VoteRepository votes, UserRepository users) {
        this.decisions = decisions;
        this.votes = votes;
        this.users = users;
    }

    private User user(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public DecisionResponse create(String email, DecisionRequest request) {
        if (request.options().size() < 2) throw new BadRequestException("At least 2 options are required");
        Decision decision = new Decision();
        decision.setOwner(user(email));
        apply(decision, request);
        return response(decisions.save(decision));
    }

    @Override @Transactional(readOnly = true)
    public Page<DecisionResponse> publicDecisions(String category, Pageable pageable) {
        Page<Decision> page = category == null || category.isBlank()
            ? decisions.findByVisibility("PUBLIC", pageable)
            : decisions.findByVisibilityAndCategory("PUBLIC", category, pageable);
        return page.map(this::response);
    }

    @Override @Transactional(readOnly = true)
    public Page<DecisionResponse> myDecisions(String email, Pageable pageable) {
        return decisions.findByOwner(user(email), pageable).map(this::response);
    }

    @Override @Transactional(readOnly = true)
    public DecisionResponse get(Long id, String email) {
        Decision decision = find(id);
        if (!"PUBLIC".equals(decision.getVisibility()) && (email == null || !decision.getOwner().getEmail().equals(email))) {
            throw new ResourceNotFoundException("Decision board not found");
        }
        return response(decision);
    }

    @Override
    public DecisionResponse update(Long id, String email, DecisionRequest request) {
        Decision decision = owned(id, email);
        if (request.options().size() < 2) throw new BadRequestException("At least 2 options are required");
        apply(decision, request);
        return response(decision);
    }

    @Override
    public DecisionResponse addOption(Long id, String email, DecisionRequest.OptionRequest request) {
        Decision decision = owned(id, email);
        decision.addOption(option(request));
        return response(decision);
    }

    @Override
    public void delete(Long id, String email) { decisions.delete(owned(id, email)); }

    @Override
    public DecisionResponse vote(Long id, String email, VoteRequest request) {
        Decision decision = find(id);
        if (decision.isClosed()) throw new BadRequestException("This decision is closed");
        DecisionOption option = decision.getOptions().stream().filter(o -> o.getId().equals(request.optionId())).findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Option not found"));
        User voter = user(email);
        if (request.anonymous() && !decision.isAllowAnonymousVoting()) throw new BadRequestException("Anonymous voting is not allowed");
        List<Vote> existing = votes.findByDecision(decision).stream().filter(v -> v.getVoter().getId().equals(voter.getId())).toList();
        if ("SINGLE_CHOICE".equals(decision.getPollType()) && !existing.isEmpty()) {
            votes.deleteAll(existing);
        } else if ("RATING".equals(decision.getPollType())) {
            votes.findByDecisionAndOptionAndVoter(decision, option, voter).ifPresent(votes::delete);
        } else if (votes.findByDecisionAndOptionAndVoter(decision, option, voter).isPresent()) {
            throw new BadRequestException("You have already voted for this option");
        }
        Vote vote = new Vote();
        vote.setDecision(decision); vote.setOption(option); vote.setVoter(voter);
        vote.setRating(request.rating()); vote.setAnonymous(request.anonymous());
        votes.save(vote);
        return response(decision);
    }

    @Override
    public DecisionResponse retract(Long id, String email, Long optionId) {
        Decision decision = find(id); User voter = user(email);
        DecisionOption option = decision.getOptions().stream().filter(o -> o.getId().equals(optionId)).findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Option not found"));
        votes.deleteByDecisionAndOptionAndVoter(decision, option, voter);
        return response(decision);
    }

    private Decision find(Long id) { return decisions.findById(id).orElseThrow(() -> new ResourceNotFoundException("Decision board not found")); }
    private Decision owned(Long id, String email) {
        Decision decision = find(id);
        if (!decision.getOwner().getEmail().equals(email)) throw new ResourceNotFoundException("Decision board not found");
        return decision;
    }

    private void apply(Decision decision, DecisionRequest request) {
        decision.setTitle(request.title()); decision.setDescription(request.description()); decision.setCategory(request.category());
        decision.setVisibility(request.visibility()); decision.setPollType(request.pollType()); decision.setAllowAnonymousVoting(request.allowAnonymousVoting());
        if (decision.getOptions().isEmpty()) request.options().forEach(input -> decision.addOption(option(input)));
    }

    private DecisionOption option(DecisionRequest.OptionRequest input) {
        DecisionOption option = new DecisionOption(); option.setTitle(input.title()); option.setDescription(input.description());
        option.setCostScore(input.costScore()); option.setBenefitsScore(input.benefitsScore()); option.setRiskScore(input.riskScore());
        option.setTimeScore(input.timeScore()); option.setConvenienceScore(input.convenienceScore()); option.setPros(input.pros()); option.setCons(input.cons());
        return option;
    }

    private DecisionResponse response(Decision decision) {
        List<Vote> allVotes = votes.findByDecision(decision);
        List<DecisionResponse.OptionResponse> mapped = new ArrayList<>();
        for (DecisionOption option : decision.getOptions()) {
            List<Vote> optionVotes = allVotes.stream().filter(v -> v.getOption().getId().equals(option.getId())).toList();
            double score = averageScore(option);
            Double rating = optionVotes.stream().map(Vote::getRating).filter(r -> r != null).mapToInt(Integer::intValue).average().isPresent()
                ? optionVotes.stream().map(Vote::getRating).filter(r -> r != null).mapToInt(Integer::intValue).average().getAsDouble() : null;
            mapped.add(new DecisionResponse.OptionResponse(option.getId(), option.getTitle(), option.getDescription(), option.getCostScore(), option.getBenefitsScore(), option.getRiskScore(), option.getTimeScore(), option.getConvenienceScore(), option.getPros(), option.getCons(), optionVotes.size(), rating, score, 0));
        }
        mapped.sort(Comparator.comparingLong(DecisionResponse.OptionResponse::voteCount).reversed());
        List<DecisionResponse.OptionResponse> ranked = new ArrayList<>();
        for (int i = 0; i < mapped.size(); i++) {
            DecisionResponse.OptionResponse o = mapped.get(i);
            ranked.add(new DecisionResponse.OptionResponse(o.id(), o.title(), o.description(), o.costScore(), o.benefitsScore(), o.riskScore(), o.timeScore(), o.convenienceScore(), o.pros(), o.cons(), o.voteCount(), o.averageRating(), o.averageScore(), i + 1));
        }
        return new DecisionResponse(decision.getId(), decision.getTitle(), decision.getDescription(), decision.getCategory(), decision.getVisibility(), decision.getPollType(), decision.isAllowAnonymousVoting(), decision.isClosed(), decision.getCreatedAt(), decision.getOwner().getName(), allVotes.size(), ranked);
    }

    private Double averageScore(DecisionOption option) {
        List<Integer> values = java.util.stream.Stream.of(option.getCostScore(), option.getBenefitsScore(), option.getRiskScore(), option.getTimeScore(), option.getConvenienceScore()).filter(v -> v != null).toList();
        return values.isEmpty() ? null : values.stream().mapToInt(Integer::intValue).average().orElse(0);
    }
}
