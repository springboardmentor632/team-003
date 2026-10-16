package com.decisionhub.service;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.DiscussionComment;
import com.decisionhub.model.User;
import com.decisionhub.repository.DiscussionCommentRepository;
import com.decisionhub.repository.DiscussionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DiscussionCommentService {

    private final DiscussionCommentRepository commentRepository;
    private final DiscussionRepository discussionRepository;

    public DiscussionCommentService(
            DiscussionCommentRepository commentRepository,
            DiscussionRepository discussionRepository) {

        this.commentRepository = commentRepository;
        this.discussionRepository = discussionRepository;
    }

    // Get all comments/replies of a discussion
    @Transactional(readOnly = true)
    public List<DiscussionComment> getComments(Long discussionId) {

        if (!discussionRepository.existsById(discussionId)) {
            throw new IllegalArgumentException("Discussion not found");
        }

        return commentRepository
                .findByDiscussionIdOrderByCreatedAtAsc(discussionId);
    }

    // Add a comment or reply
    @Transactional
    public DiscussionComment addComment(
            Long discussionId,
            String content,
            Long parentCommentId,
            User author) {

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content is required");
        }

        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Discussion not found"));

        DiscussionComment parentComment = null;

        if (parentCommentId != null) {
            parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Parent comment not found"));

            if (!parentComment.getDiscussion()
                    .getId()
                    .equals(discussionId)) {

                throw new IllegalArgumentException(
                        "Parent comment belongs to another discussion");
            }
        }

        DiscussionComment comment =
                new DiscussionComment(
                        content.trim(),
                        discussion,
                        author,
                        parentComment
                );

        return commentRepository.save(comment);
    }

    // Delete comment
    @Transactional
    public void deleteComment(Long commentId, User user) {

        DiscussionComment comment =
                commentRepository.findById(commentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Comment not found"));

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException(
                    "Only the comment author can delete this comment");
        }

        commentRepository.delete(comment);
    }
}