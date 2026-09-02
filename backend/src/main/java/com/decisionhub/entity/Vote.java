package com.decisionhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "votes")
public class Vote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Decision decision;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private DecisionOption option;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private User voter;
    private Integer rating;
    @Column(nullable = false) private boolean anonymous;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision value) { decision = value; }
    public DecisionOption getOption() { return option; }
    public void setOption(DecisionOption value) { option = value; }
    public User getVoter() { return voter; }
    public void setVoter(User value) { voter = value; }
    public Integer getRating() { return rating; }
    public void setRating(Integer value) { rating = value; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean value) { anonymous = value; }
}
