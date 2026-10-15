package com.decisionhub.repository;

import com.decisionhub.model.Discussion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    List<Discussion> findAllByOrderByCreatedAtDesc();

    List<Discussion> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}