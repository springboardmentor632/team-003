package com.decisionhub.repository;

import com.decisionhub.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
	List<Decision> findByCreatedBy(String createdBy);
    Page<Decision> findByCreatedBy(String createdBy, Pageable pageable);
    Page<Decision> findByVisibility(String visibility, Pageable pageable);
    Page<Decision> findByVisibilityAndCategoryIgnoreCase(String visibility, String category, Pageable pageable);
    List<Decision> findByCommunity_IdOrderByCreatedAtDesc(Long communityId);
}
