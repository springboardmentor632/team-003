package com.decisionhub.repository;

import com.decisionhub.entity.Report;
import com.decisionhub.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtAsc(ReportStatus status);
    List<Report> findByDecisionId(Long decisionId);
}