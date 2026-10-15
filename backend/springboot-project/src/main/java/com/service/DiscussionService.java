package com.decisionhub.service;

import com.decisionhub.model.Discussion;
import com.decisionhub.model.User;
import com.decisionhub.repository.DiscussionRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DiscussionService {

    private final DiscussionRepository discussions;

    public DiscussionService(DiscussionRepository discussions) {
        this.discussions = discussions;
    }

    @Transactional(readOnly = true)
    public List<Discussion> getAllDiscussions() {
        return discussions.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Discussion getDiscussionById(Long id) {
        return discussions.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discussion not found"));
    }

    @Transactional
    public Discussion createDiscussion(String title, String content, User author) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Discussion title is required");
        }

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Discussion content is required");
        }

        Discussion discussion =
                new Discussion(title.trim(), content.trim(), author);

        return discussions.save(discussion);
    }

    @Transactional
    public void deleteDiscussion(Long id, User user) {

        Discussion discussion = getDiscussionById(id);

        if (!discussion.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException(
                    "Only the discussion author can delete this discussion"
            );
        }

        discussions.delete(discussion);
    }

    @Transactional(readOnly = true)
    public List<Discussion> getMyDiscussions(User user) {
        return discussions.findByAuthorIdOrderByCreatedAtDesc(user.getId());
    }
}