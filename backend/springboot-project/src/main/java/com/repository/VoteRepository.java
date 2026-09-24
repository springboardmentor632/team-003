package com.decisionhub.repository;

import com.decisionhub.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByDecisionIdAndVoterId(Long decisionId, Long voterId);
    boolean existsByDecisionIdAndVoterId(Long decisionId, Long voterId);
    long countByOptionId(Long optionId);
    Optional<Vote> findByDecisionIdAndOptionIdAndVoterId(Long decisionId, Long optionId, Long voterId);
    List<Vote> findByDecisionId(Long decisionId);
}
