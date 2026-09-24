package com.decisionhub.service;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.model.Comment;
import com.decisionhub.model.Decision;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {
    private final CommentRepository comments;
    private final DecisionRepository decisions;
    private final UserRepository users;
    private final NotificationService notifications;
    private final AuthorizationService authorization;
    public CommentService(CommentRepository comments, DecisionRepository decisions, UserRepository users, NotificationService notifications, AuthorizationService authorization) {
        this.comments = comments; this.decisions = decisions; this.users = users; this.notifications = notifications; this.authorization = authorization;
    }
    @Transactional(readOnly = true)
    public List<Comment> list(Long decisionId) { return comments.findByDecisionIdOrderByCreatedAtAsc(decisionId); }
    @Transactional
    public Comment create(Long decisionId, CommentRequest request, User author) {
        if (request.getContent() == null || request.getContent().isBlank()) throw new IllegalArgumentException("Comment text is required");
        Decision decision = decisions.findById(decisionId).orElseThrow(() -> new IllegalArgumentException("Decision not found"));
        Comment comment = new Comment(request.getContent().trim(), decision, author);
        if (request.getParentCommentId() != null) comment.setParentComment(comments.findById(request.getParentCommentId()).orElseThrow(() -> new IllegalArgumentException("Parent comment not found")));
        Comment saved = comments.save(comment);
        users.findFirstByName(decision.getCreatedBy()).filter(owner -> !owner.getId().equals(author.getId()))
            .ifPresent(owner -> notifications.notify(owner, NotificationType.COMMENT, author.getName() + " commented on " + decision.getTitle(), decision));
        return saved;
    }
    @Transactional
    public Comment react(Long id, User user) {
        Comment comment = comments.findById(id).orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        comment.setReactionCount(comment.getReactionCount() + 1);
        return comments.save(comment);
    }
    @Transactional
    public void delete(Long id, User user) {
        Comment comment = comments.findById(id).orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId()) && !authorization.canModerate(comment.getDecision(), user)) throw new SecurityException("Only the author, a community moderator, or an admin can delete this comment");
        comments.delete(comment);
    }
}
