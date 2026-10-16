package com.decisionhub.service;

import com.decisionhub.model.Comment;
import com.decisionhub.model.Community;
import com.decisionhub.model.Decision;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CommentServiceTest {
    private CommentRepository comments;
    private DecisionRepository decisions;
    private AuthorizationService authorization;
    private CommentService commentService;
    private Decision decision;
    private Comment hiddenComment;
    private User member;
    private User moderator;

    @BeforeEach
    void setUp() {
        comments = mock(CommentRepository.class);
        decisions = mock(DecisionRepository.class);
        UserRepository users = mock(UserRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        authorization = mock(AuthorizationService.class);
        commentService = new CommentService(comments, decisions, users, notifications, authorization);

        User owner = user(1L, "Owner", "USER");
        member = user(2L, "Member", "USER");
        moderator = user(3L, "Moderator", "USER");
        Community community = new Community("Product Builders", "", owner);
        community.setId(10L);
        decision = new Decision();
        decision.setId(20L);
        decision.setCommunity(community);
        hiddenComment = new Comment("Reported comment", decision, owner);
        hiddenComment.setId(30L);
        hiddenComment.setHidden(true);
    }

    @Test
    void list_excludesHiddenCommentsForNormalUsers() {
        when(decisions.findById(20L)).thenReturn(Optional.of(decision));
        when(authorization.canModerate(decision.getCommunity(), member)).thenReturn(false);
        when(comments.findByDecisionIdOrderByCreatedAtAsc(20L)).thenReturn(List.of(hiddenComment));

        assertEquals(List.of(), commentService.list(20L, member));
    }

    @Test
    void list_includesHiddenCommentsForCommunityModerators() {
        when(decisions.findById(20L)).thenReturn(Optional.of(decision));
        when(authorization.canModerate(decision.getCommunity(), moderator)).thenReturn(true);
        when(comments.findByDecisionIdOrderByCreatedAtAsc(20L)).thenReturn(List.of(hiddenComment));

        assertEquals(List.of(hiddenComment), commentService.list(20L, moderator));
    }

    @Test
    void hideAndUnhide_requireModerationAndPersistState() {
        when(comments.findById(30L)).thenReturn(Optional.of(hiddenComment));
        when(authorization.canModerate(decision, moderator)).thenReturn(true);
        when(comments.save(hiddenComment)).thenReturn(hiddenComment);

        hiddenComment.setHidden(false);
        commentService.setHidden(30L, true, moderator);
        assertEquals(true, hiddenComment.isHidden());
        commentService.setHidden(30L, false, moderator);
        assertEquals(false, hiddenComment.isHidden());

        when(authorization.canModerate(decision, member)).thenReturn(false);
        assertThrows(SecurityException.class, () -> commentService.setHidden(30L, true, member));
    }

    private User user(Long id, String name, String role) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setRole(role);
        return user;
    }
}
