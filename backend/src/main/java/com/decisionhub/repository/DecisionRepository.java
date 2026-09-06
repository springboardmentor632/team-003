package com.decisionhub.repository;

import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
    List<Decision> findByCreatorId(Long creatorId);
    List<Decision> findByStatus(DecisionStatus status);
    List<Decision> findByCommunityId(Long communityId);
}