package com.decisionhub.repository;

import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
    Page<Decision> findByVisibilityAndCategory(String visibility, String category, Pageable pageable);
    Page<Decision> findByVisibility(String visibility, Pageable pageable);
    Page<Decision> findByOwner(User owner, Pageable pageable);
}
