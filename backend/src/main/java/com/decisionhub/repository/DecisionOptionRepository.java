package com.decisionhub.repository;

import com.decisionhub.entity.DecisionOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DecisionOptionRepository extends JpaRepository<DecisionOption, Long> {
    List<DecisionOption> findByDecisionId(Long decisionId);
}