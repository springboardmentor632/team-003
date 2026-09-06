package com.decisionhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "votes", uniqueConstraints = @UniqueConstraint(name = "uk_vote_decision_user", columnNames = {"decision_id", "voter_id"}))
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "option_id", nullable = false)
    private DecisionOption option;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Vote() {}

    public Vote(Decision decision, DecisionOption option, User voter) {
        this.decision = decision;
        this.option = option;
        this.voter = voter;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision decision) { this.decision = decision; }
    public DecisionOption getOption() { return option; }
    public void setOption(DecisionOption option) { this.option = option; }
    public User getVoter() { return voter; }
    public void setVoter(User voter) { this.voter = voter; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}