package com.decisionhub.repository;

import com.decisionhub.model.FcmToken;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {

    @Query("SELECT t FROM FcmToken t WHERE t.user.id = :userId")
    List<FcmToken> findByUserId(@Param("userId") Long userId);

    Optional<FcmToken> findByToken(String token);

    @Modifying
    @Query("DELETE FROM FcmToken t WHERE t.token = :token")
    void deleteByToken(@Param("token") String token);

    @Modifying
    @Query("DELETE FROM FcmToken t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM FcmToken t WHERE t.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
