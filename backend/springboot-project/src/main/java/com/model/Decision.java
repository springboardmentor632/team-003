package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "decisions")
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String createdBy;

    @Column(nullable = false)
    private String category = "General";

    @Column(nullable = false)
    private String visibility = "PUBLIC";

    @Column(nullable = false)
    private String pollType = "SINGLE_CHOICE";

    @Column(nullable = false)
    private boolean allowAnonymousVoting;

    @Column(nullable = false)
    private boolean closed;

    @ManyToOne
    @JoinColumn(name = "community_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Community community;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "decision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options = new ArrayList<>();

    @Transient
    private long totalVotes;

    public Decision() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatedByName() { return createdBy; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category == null || category.isBlank() ? "General" : category; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility == null ? "PUBLIC" : visibility.toUpperCase(); }
    public String getPollType() { return pollType; }
    public void setPollType(String pollType) { this.pollType = pollType == null ? "SINGLE_CHOICE" : pollType.toUpperCase(); }
    public boolean isAllowAnonymousVoting() { return allowAnonymousVoting; }
    public void setAllowAnonymousVoting(boolean allowAnonymousVoting) { this.allowAnonymousVoting = allowAnonymousVoting; }
    public boolean isClosed() { return closed; }
    public void setClosed(boolean closed) { this.closed = closed; }
    public Community getCommunity() { return community; }
    public void setCommunity(Community community) { this.community = community; }
    public Long getCommunityId() { return community == null ? null : community.getId(); }
    public long getTotalVotes() { return totalVotes; }
    public void setTotalVotes(long totalVotes) { this.totalVotes = totalVotes; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Option> getOptions() {
        return options;
    }

    public void setOptions(List<Option> options) {
        // Preserve Hibernate's managed collection so orphan-removal remains valid.
        this.options.clear();
        if (options != null) {
            this.options.addAll(options);
        }
    }
}
