package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3000)
    private String content;

    @ManyToOne(optional = false)
    @JoinColumn(name = "decision_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Decision decision;

    @ManyToOne
    @JoinColumn(name = "community_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Community community;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Comment parentComment;

    @Column(nullable = false)
    private long reactionCount;
    @Column(nullable = false)
    private boolean hidden;

    public Comment() {}
    public Comment(String content, Decision decision, User author) { this.content = content; this.decision = decision; this.author = author; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getBody() { return content; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision decision) { this.decision = decision; }
    public Community getCommunity() { return community; } public void setCommunity(Community community) { this.community = community; }
    public Long getCommunityId() { return community == null ? null : community.getId(); }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public String getAuthorName() { return author == null ? "" : author.getName(); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Comment getParentComment() { return parentComment; }
    public void setParentComment(Comment parentComment) { this.parentComment = parentComment; }
    public Long getParentCommentId() { return parentComment == null ? null : parentComment.getId(); }
    public long getReactionCount() { return reactionCount; }
    public void setReactionCount(long reactionCount) { this.reactionCount = reactionCount; }
    public boolean isHidden() { return hidden; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
}
