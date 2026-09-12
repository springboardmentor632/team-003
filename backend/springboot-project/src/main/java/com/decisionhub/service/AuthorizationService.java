package com.decisionhub.service;

import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.Decision;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommunityMembershipRepository;
import org.springframework.stereotype.Service;

/** Centralizes privileged checks so a role alone never grants community-wide power. */
@Service
public class AuthorizationService {
    private final CommunityMembershipRepository memberships;
    public AuthorizationService(CommunityMembershipRepository memberships) { this.memberships = memberships; }

    public boolean isAdmin(User user) { return user != null && "ADMIN".equalsIgnoreCase(user.getRole()); }

    public boolean canModerate(Community community, User user) {
        if (isAdmin(user)) return true;
        if (community == null || user == null) return false;
        if (community.getOwner().getId().equals(user.getId())) return true;
        return memberships.findByCommunityIdAndUserId(community.getId(), user.getId())
                .map(membership -> "MODERATOR".equalsIgnoreCase(membership.getRole()))
                .orElse(false);
    }

    public boolean canModerate(Decision decision, User user) { return canModerate(decision.getCommunity(), user); }

    public void requireCommunityModerator(Community community, User user) {
        if (!canModerate(community, user)) throw new SecurityException("A community moderator or admin is required");
    }
}
