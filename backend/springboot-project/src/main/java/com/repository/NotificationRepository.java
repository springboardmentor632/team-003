package com.decisionhub.repository;

import com.decisionhub.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    long countByRecipientIdAndReadAtIsNull(Long recipientId);
    @Modifying @Query("update Notification n set n.readAt = :now where n.recipient.id = :recipientId and n.readAt is null")
    int markAllRead(@Param("recipientId") Long recipientId, @Param("now") LocalDateTime now);
    @Query("select count(n) > 0 from Notification n where n.recipient.id = :recipientId and n.type = :type and n.decision.id = :decisionId and n.createdAt > :createdAt")
    boolean existsByRecipientIdAndTypeAndDecisionIdAndCreatedAtAfter(@Param("recipientId") Long recipientId, @Param("type") com.decisionhub.model.NotificationType type, @Param("decisionId") Long decisionId, @Param("createdAt") LocalDateTime createdAt);
}
