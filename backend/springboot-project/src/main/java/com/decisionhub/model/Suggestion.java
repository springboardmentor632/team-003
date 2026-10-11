package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suggestions")
public class Suggestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 3000) private String content;
    @ManyToOne(optional = false) @JoinColumn(name = "decision_id", nullable = false) @com.fasterxml.jackson.annotation.JsonIgnore private Decision decision;
    @ManyToOne(optional = false) @JoinColumn(name = "author_id", nullable = false) @com.fasterxml.jackson.annotation.JsonIgnore private User author;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
    public Suggestion() {}
    public Suggestion(String content, Decision decision, User author) { this.content = content; this.decision = decision; this.author = author; }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public String getAdvice() { return content; }
    public Decision getDecision() { return decision; } public void setDecision(Decision decision) { this.decision = decision; }
    public User getAuthor() { return author; } public void setAuthor(User author) { this.author = author; }
    public String getAuthorName() { return author == null ? "" : author.getName(); }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
