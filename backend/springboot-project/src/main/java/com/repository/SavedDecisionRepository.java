package com.decisionhub.repository;

import com.decisionhub.model.SavedDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedDecisionRepository extends JpaRepository<SavedDecision, Long> {
    List<SavedDecision> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SavedDecision> findByUserIdAndDecisionId(Long userId, Long decisionId);
    boolean existsByUserIdAndDecisionId(Long userId, Long decisionId);
    void deleteByUserIdAndDecisionId(Long userId, Long decisionId);
}
