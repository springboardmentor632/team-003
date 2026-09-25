package com.decisionhub.service;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.model.Community;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.model.NotificationType;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DecisionService {
    private final DecisionRepository decisions;
    private final OptionRepository options;
    private final VoteRepository votes;
    private final CommunityRepository communities;
    private final UserRepository users;
    private final NotificationService notifications;
    private final AuthorizationService authorization;

    public DecisionService(DecisionRepository decisions, OptionRepository options, VoteRepository votes, CommunityRepository communities, UserRepository users, NotificationService notifications, AuthorizationService authorization) {
        this.decisions = decisions;
        this.options = options;
        this.votes = votes;
        this.communities = communities;
        this.users = users;
        this.notifications = notifications;
        this.authorization = authorization;
    }

    @Transactional
    public Decision createDecision(DecisionRequest request, User creator) {
        if (request.getCommunityId() != null) {
            Community community = communities.findById(request.getCommunityId()).orElseThrow(() -> new IllegalArgumentException("Community not found"));
            if (!authorization.isAdmin(creator) && !authorization.isCommunityMember(community, creator)) {
                throw new SecurityException("Join this community before creating a decision board");
            }
        }
        Decision decision = new Decision();
        apply(decision, request);
        decision.setCreatedBy(creator == null ? request.getCreatedBy() : creator.getName());
        if (decision.getCreatedBy() == null || decision.getCreatedBy().isBlank()) decision.setCreatedBy("DecisionHub member");
        Decision saved = decisions.save(decision);
        request.getOptions().forEach(option -> addOption(saved, option));
        return hydrate(saved);
    }

    @Transactional(readOnly = true)
    public Page<Decision> publicDecisions(String category, Pageable pageable) {
        Page<Decision> page = category == null || category.isBlank()
            ? decisions.findByVisibility("PUBLIC", pageable)
            : decisions.findByVisibilityAndCategoryIgnoreCase("PUBLIC", category, pageable);
        page.forEach(this::hydrate);
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Decision> myDecisions(User user, Pageable pageable) {
        Page<Decision> page = decisions.findByCreatedBy(user.getName(), pageable);
        page.forEach(this::hydrate);
        return page;
    }

    @Transactional(readOnly = true)
    public List<Decision> getAllDecisions() {
        List<Decision> all = decisions.findAll();
        all.forEach(this::hydrate);
        return all;
    }

    @Transactional(readOnly = true)
    public List<Decision> communityDecisions(Long communityId) {
        if (!communities.existsById(communityId)) throw new IllegalArgumentException("Community not found");
        List<Decision> boards = decisions.findByCommunity_IdOrderByCreatedAtDesc(communityId);
        boards.forEach(this::hydrate);
        return boards;
    }

    @Transactional(readOnly = true)
    public List<Decision> analyticsVisibleTo(User user) {
        return getAllDecisions().stream()
            .filter(decision -> "PUBLIC".equals(decision.getVisibility()) || decision.getCreatedBy().equals(user.getName()))
            .toList();
    }

    @Transactional(readOnly = true)
    public Decision getDecisionById(Long id) { return hydrate(raw(id)); }

    @Transactional
    public Decision updateDecision(Long id, DecisionRequest request, User user) {
        Decision decision = raw(id);
        requireOwnerOrAdmin(decision, user);
        boolean wasClosed = decision.isClosed();
        apply(decision, request);
        Decision saved = decisions.save(decision);
        users.findFirstByName(saved.getCreatedBy()).filter(owner -> !owner.getId().equals(user.getId())).ifPresent(owner ->
            notifications.notify(owner, NotificationType.DECISION_UPDATED, user.getName() + " updated " + saved.getTitle(), saved));
        if (!wasClosed && saved.isClosed()) users.findFirstByName(saved.getCreatedBy()).ifPresent(owner ->
            notifications.notify(owner, NotificationType.POLL_COMPLETED, saved.getTitle() + " has been closed", saved));
        return hydrate(saved);
    }

    @Transactional
    public void deleteDecision(Long id, User user) {
        Decision decision = raw(id);
        requireOwnerOrAdmin(decision, user);
        decisions.delete(decision);
    }

    @Transactional
    public Option addOption(Long decisionId, OptionRequest request, User user) {
        Decision decision = raw(decisionId);
        requireOwnerOrAdmin(decision, user);
        if (decision.isClosed()) throw new IllegalStateException("Closed boards cannot be changed");
        return addOption(decision, request);
    }

    @Transactional(readOnly = true)
    public List<Option> getOptions(Long decisionId) { return hydrate(raw(decisionId)).getOptions(); }

    @Transactional
    public Decision castVote(Long decisionId, VoteRequest request, User voter) {
        Decision decision = raw(decisionId);
        if (decision.isClosed()) throw new IllegalStateException("This board is closed");
        if (request.getOptionId() == null) throw new IllegalArgumentException("Choose an option");
        Option option = options.findById(request.getOptionId()).orElseThrow(() -> new IllegalArgumentException("Option not found"));
        if (!option.getDecision().getId().equals(decision.getId())) throw new IllegalArgumentException("Option does not belong to this board");
        if (request.isAnonymous() && !decision.isAllowAnonymousVoting()) throw new IllegalArgumentException("Anonymous voting is not enabled for this board");
        if ("RATING".equals(decision.getPollType()) && (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5)) throw new IllegalArgumentException("A rating from 1 to 5 is required");
        if ("SINGLE_CHOICE".equals(decision.getPollType()) && votes.existsByDecisionIdAndVoterId(decisionId, voter.getId())) throw new IllegalStateException("You have already voted on this board");
        Vote vote = votes.findByDecisionIdAndOptionIdAndVoterId(decisionId, option.getId(), voter.getId()).orElseGet(() -> new Vote(decision, option, voter));
        vote.setAnonymous(request.isAnonymous());
        vote.setRating("RATING".equals(decision.getPollType()) ? request.getRating() : null);
        votes.save(vote);
        users.findFirstByName(decision.getCreatedBy()).filter(owner -> !owner.getId().equals(voter.getId()))
            .ifPresent(owner -> notifications.notify(owner, NotificationType.VOTE, voter.getName() + " voted on " + decision.getTitle(), decision));
        return hydrate(decision);
    }

    @Transactional
    public Decision retractVote(Long decisionId, Long optionId, User voter) {
        Vote vote = votes.findByDecisionIdAndOptionIdAndVoterId(decisionId, optionId, voter.getId()).orElseThrow(() -> new IllegalArgumentException("Vote not found"));
        votes.delete(vote);
        return hydrate(raw(decisionId));
    }

    @Transactional(readOnly = true)
    public Decision results(Long decisionId) { return hydrate(raw(decisionId)); }

    private Decision raw(Long id) { return decisions.findById(id).orElseThrow(() -> new IllegalArgumentException("Decision not found")); }

    private void apply(Decision decision, DecisionRequest request) {
        if (request.getTitle() != null) decision.setTitle(request.getTitle());
        if (request.getDescription() != null) decision.setDescription(request.getDescription());
        decision.setCategory(request.getCategory());
        decision.setVisibility(request.getVisibility());
        decision.setPollType(request.getPollType());
        decision.setAllowAnonymousVoting(request.isAllowAnonymousVoting());
        if (request.getClosed() != null) decision.setClosed(request.getClosed());
        if (request.getCommunityId() != null) {
            Community community = communities.findById(request.getCommunityId()).orElseThrow(() -> new IllegalArgumentException("Community not found"));
            decision.setCommunity(community);
        }
    }

    private Option addOption(Decision decision, OptionRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) throw new IllegalArgumentException("Option title is required");
        Option option = new Option();
        option.setTitle(request.getTitle());
        option.setDescription(request.getDescription());
        option.setPros(request.getPros());
        option.setCons(request.getCons());
        option.setCostScore(request.getCostScore());
        option.setBenefitsScore(request.getBenefitsScore());
        option.setRiskScore(request.getRiskScore());
        option.setTimeScore(request.getTimeScore());
        option.setConvenienceScore(request.getConvenienceScore());
        option.setDecision(decision);
        return options.save(option);
    }

    private Decision hydrate(Decision decision) {
        List<Vote> boardVotes = votes.findByDecisionId(decision.getId());
        decision.setTotalVotes(boardVotes.size());
        List<Option> decisionOptions = options.findByDecisionId(decision.getId());
        decision.setOptions(decisionOptions);
        decisionOptions.forEach(option -> {
            List<Vote> optionVotes = boardVotes.stream().filter(v -> v.getOption().getId().equals(option.getId())).toList();
            option.setVoteCount(optionVotes.size());
            double average = optionVotes.stream().map(Vote::getRating).filter(r -> r != null).mapToInt(Integer::intValue).average().orElse(Double.NaN);
            option.setAverageRating(Double.isNaN(average) ? null : average);
        });
        decisionOptions.stream().sorted(Comparator.comparingLong(Option::getVoteCount).reversed()).forEachOrdered(new java.util.function.Consumer<Option>() {
            int rank = 1;
            public void accept(Option option) { option.setRank(rank++); }
        });
        return decision;
    }

    private void requireOwnerOrAdmin(Decision decision, User user) {
        if (authorization.isAdmin(user) || decision.getCreatedBy().equals(user.getName()) || authorization.canModerate(decision, user)) return;
        throw new SecurityException("Only the board owner, its community moderator, or an admin can do that");
    }
}
