package com.decisionhub.repository;

import com.decisionhub.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    @Query("SELECT a FROM Attachment a WHERE a.decision.id = :decisionId")
    List<Attachment> findByDecisionId(@Param("decisionId") Long decisionId);

    @Query("SELECT a FROM Attachment a WHERE a.option.id = :optionId")
    List<Attachment> findByOptionId(@Param("optionId") Long optionId);

    List<Attachment> findByUploadedBy(String uploadedBy);
}
