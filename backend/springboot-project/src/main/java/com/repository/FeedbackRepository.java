package com.decisionhub.repository;
import com.decisionhub.model.Feedback;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FeedbackRepository extends JpaRepository<Feedback, Long> { List<Feedback> findAllByOrderByCreatedAtDesc(); List<Feedback> findByAuthorIdOrderByCreatedAtDesc(Long authorId); }
