package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes", uniqueConstraints = @UniqueConstraint(name = "uk_vote_decision_user", columnNames = {"decision_id", "voter_id"}))
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @ManyToOne(optional = false)
    @JoinColumn(name = "option_id", nullable = false)
    private Option option;

    @ManyToOne(optional = false)
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Vote() {}
    public Vote(Decision decision, Option option, User voter) { this.decision = decision; this.option = option; this.voter = voter; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision decision) { this.decision = decision; }
    public Option getOption() { return option; }
    public void setOption(Option option) { this.option = option; }
    public User getVoter() { return voter; }
    public void setVoter(User voter) { this.voter = voter; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}