package com.decisionhub.repository;
import com.decisionhub.model.Suggestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> { List<Suggestion> findByDecisionIdOrderByCreatedAtDesc(Long decisionId); }
