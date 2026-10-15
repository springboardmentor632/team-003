package com.decisionhub.repository;

import com.decisionhub.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findByDecisionId(Long decisionId);
}