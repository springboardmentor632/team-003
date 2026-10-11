package com.decisionhub.service;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.User;
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
class DiscussionServiceTest {

    @Mock private DiscussionRepository discussions;
    @InjectMocks private DiscussionService discussionService;

    private User author;
    private Discussion discussion;

    @BeforeEach
    void setUp() {
        author = new User("Harish", "harish@decisionhub.local", "pass", "USER");
        author.setId(1L);

        discussion = new Discussion("Architecture RFC", "Microservices vs Modular Monolith", author);
        discussion.setId(10L);
    }

    @Test
    @DisplayName("createDiscussion - Rejects empty title or content")
    void testCreateDiscussion_Validation() {
        assertThrows(IllegalArgumentException.class, () -> discussionService.createDiscussion("", "Content", author));
        assertThrows(IllegalArgumentException.class, () -> discussionService.createDiscussion("Title", "   ", author));
    }

    @Test
    @DisplayName("createDiscussion - Persists and returns new discussion")
    void testCreateDiscussion_Success() {
        when(discussions.save(any(Discussion.class))).thenReturn(discussion);

        Discussion created = discussionService.createDiscussion("Architecture RFC", "Microservices vs Modular Monolith", author);

        assertNotNull(created);
        assertEquals("Architecture RFC", created.getTitle());
        verify(discussions).save(any(Discussion.class));
    }

    @Test
    @DisplayName("deleteDiscussion - Prevents non-author from deleting thread")
    void testDeleteDiscussion_NonAuthor_ThrowsSecurityException() {
        when(discussions.findById(10L)).thenReturn(Optional.of(discussion));

        User stranger = new User("Stranger", "stranger@decisionhub.local", "pass", "USER");
        stranger.setId(2L);

        assertThrows(SecurityException.class, () -> discussionService.deleteDiscussion(10L, stranger));
        verify(discussions, never()).delete(any());
    }

    @Test
    @DisplayName("deleteDiscussion - Author successfully deletes thread")
    void testDeleteDiscussion_Author_Success() {
        when(discussions.findById(10L)).thenReturn(Optional.of(discussion));

        assertDoesNotThrow(() -> discussionService.deleteDiscussion(10L, author));
        verify(discussions).delete(discussion);
    }

    @Test
    @DisplayName("getMyDiscussions - Returns user's authored discussions")
    void testGetMyDiscussions() {
        when(discussions.findByAuthorIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(discussion));

        List<Discussion> myDiscussions = discussionService.getMyDiscussions(author);

        assertEquals(1, myDiscussions.size());
        assertEquals(discussion.getId(), myDiscussions.get(0).getId());
    }
}
