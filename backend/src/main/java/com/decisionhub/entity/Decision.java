package com.decisionhub.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "decisions")
public class Decision {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200) private String title;
    @Column(length = 2000) private String description;
    @Column(nullable = false, length = 50) private String category;
    @Column(nullable = false, length = 20) private String visibility;
    @Column(nullable = false, length = 30) private String pollType;
    @Column(nullable = false) private boolean allowAnonymousVoting;
    @Column(nullable = false) private boolean closed;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private User owner;
    @OneToMany(mappedBy = "decision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DecisionOption> options = new ArrayList<>();

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getPollType() { return pollType; }
    public void setPollType(String pollType) { this.pollType = pollType; }
    public boolean isAllowAnonymousVoting() { return allowAnonymousVoting; }
    public void setAllowAnonymousVoting(boolean allowAnonymousVoting) { this.allowAnonymousVoting = allowAnonymousVoting; }
    public boolean isClosed() { return closed; }
    public void setClosed(boolean closed) { this.closed = closed; }
    public Instant getCreatedAt() { return createdAt; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public List<DecisionOption> getOptions() { return options; }
    public void addOption(DecisionOption option) { options.add(option); option.setDecision(this); }
}
