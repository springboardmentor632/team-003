package com.decisionhub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_comments")
public class DiscussionComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3000)
    private String content;

    @ManyToOne(optional = false)
    @JoinColumn(name = "discussion_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Discussion discussion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DiscussionComment parentComment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DiscussionComment() {
    }

    public DiscussionComment(
            String content,
            Discussion discussion,
            User author,
            DiscussionComment parentComment) {

        this.content = content;
        this.discussion = discussion;
        this.author = author;
        this.parentComment = parentComment;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public User getAuthor() {
        return author;
    }

    public String getAuthorName() {
        return author == null ? "" : author.getName();
    }

    public DiscussionComment getParentComment() {
        return parentComment;
    }

    public Long getParentCommentId() {
        return parentComment == null ? null : parentComment.getId();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}