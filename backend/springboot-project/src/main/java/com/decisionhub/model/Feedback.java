package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_entries")
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 3000) private String message;
    @ManyToOne(optional = false) @JoinColumn(name = "author_id", nullable = false) @com.fasterxml.jackson.annotation.JsonIgnore private User author;
    @ManyToOne @JoinColumn(name = "decision_id") @com.fasterxml.jackson.annotation.JsonIgnore private Decision decision;
    @Column(nullable = false, length = 30) private String status = "OPEN";
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
    public Feedback() {}
    public Feedback(String message, User author) { this.message = message; this.author = author; }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; } public void setMessage(String message) { this.message = message; }
    public User getAuthor() { return author; } public void setAuthor(User author) { this.author = author; }
    public Decision getDecision() { return decision; } public void setDecision(Decision decision) { this.decision = decision; }
    public Long getDecisionId() { return decision == null ? null : decision.getId(); }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getAuthorName() { return author == null ? "" : author.getName(); }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
