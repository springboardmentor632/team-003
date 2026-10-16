package com.decisionhub.service;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.DiscussionComment;
import com.decisionhub.model.User;
import com.decisionhub.repository.DiscussionCommentRepository;
import com.decisionhub.repository.DiscussionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscussionCommentServiceTest {

    @Mock private DiscussionCommentRepository commentRepository;
    @Mock private DiscussionRepository discussionRepository;

    @InjectMocks private DiscussionCommentService commentService;

    private User author;
    private Discussion discussion;
    private DiscussionComment parentComment;

    @BeforeEach
    void setUp() {
        author = new User("Harish", "harish@decisionhub.local", "pass", "USER");
        author.setId(1L);

        discussion = new Discussion("Architecture RFC", "Content", author);
        discussion.setId(10L);

        parentComment = new DiscussionComment("Top level argument", discussion, author, null);
        parentComment.setId(100L);
    }

    @Test
    @DisplayName("addComment - Adds top-level comment successfully")
    void testAddComment_TopLevel_Success() {
        when(discussionRepository.findById(10L)).thenReturn(Optional.of(discussion));
        when(commentRepository.save(any(DiscussionComment.class))).thenAnswer(i -> i.getArgument(0));

        DiscussionComment created = commentService.addComment(10L, "New comment", null, author);

        assertNotNull(created);
        assertEquals("New comment", created.getContent());
        assertNull(created.getParentComment());
        verify(commentRepository).save(any(DiscussionComment.class));
    }

    @Test
    @DisplayName("addComment - Adds nested reply to parent comment")
    void testAddComment_NestedReply_Success() {
        when(discussionRepository.findById(10L)).thenReturn(Optional.of(discussion));
        when(commentRepository.findById(100L)).thenReturn(Optional.of(parentComment));
        when(commentRepository.save(any(DiscussionComment.class))).thenAnswer(i -> i.getArgument(0));

        DiscussionComment reply = commentService.addComment(10L, "Supporting reply", 100L, author);

        assertNotNull(reply);
        assertEquals("Supporting reply", reply.getContent());
        assertEquals(parentComment, reply.getParentComment());
    }

    @Test
    @DisplayName("addComment - Rejects reply if parent comment belongs to different discussion")
    void testAddComment_ParentBelongsToDifferentDiscussion_ThrowsException() {
        Discussion otherDiscussion = new Discussion("Other", "Other Content", author);
        otherDiscussion.setId(99L);
        DiscussionComment foreignParent = new DiscussionComment("Foreign", otherDiscussion, author, null);
        foreignParent.setId(200L);

        when(discussionRepository.findById(10L)).thenReturn(Optional.of(discussion));
        when(commentRepository.findById(200L)).thenReturn(Optional.of(foreignParent));

        assertThrows(IllegalArgumentException.class,
                () -> commentService.addComment(10L, "Mismatch reply", 200L, author));
    }

    @Test
    @DisplayName("deleteComment - Prevents non-author from deleting comment")
    void testDeleteComment_NonAuthor_ThrowsSecurityException() {
        when(commentRepository.findById(100L)).thenReturn(Optional.of(parentComment));

        User stranger = new User("Stranger", "stranger@decisionhub.local", "pass", "USER");
        stranger.setId(2L);

        assertThrows(SecurityException.class, () -> commentService.deleteComment(100L, stranger));
        verify(commentRepository, never()).delete(any());
    }
}
