package com.decisionhub.repository;

import com.decisionhub.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByDecision(Decision decision);
    Optional<Vote> findByDecisionAndOptionAndVoter(Decision decision, DecisionOption option, User voter);
    void deleteByDecisionAndOptionAndVoter(Decision decision, DecisionOption option, User voter);
}
