package com.decisionhub.repository;
import com.decisionhub.model.CommunityInvitation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CommunityInvitationRepository extends JpaRepository<CommunityInvitation,Long>{ List<CommunityInvitation> findByInviteeIdAndStatus(Long inviteeId,String status); }
