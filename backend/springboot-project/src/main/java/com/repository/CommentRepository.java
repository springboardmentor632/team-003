package com.decisionhub.repository;

import com.decisionhub.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDecisionIdOrderByCreatedAtAsc(Long decisionId);
}