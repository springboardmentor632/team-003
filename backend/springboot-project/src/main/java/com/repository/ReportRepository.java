package com.decisionhub.repository;

import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtAsc(ReportStatus status);
    List<Report> findByDecisionId(Long decisionId);
}