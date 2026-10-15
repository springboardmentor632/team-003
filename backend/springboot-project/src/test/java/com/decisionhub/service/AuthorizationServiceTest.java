package com.decisionhub.service;

import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommunityMembershipRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthorizationServiceTest {
    @Test
    void moderatorPrivilegeIsLimitedToTheirCommunity() {
        CommunityMembershipRepository memberships = mock(CommunityMembershipRepository.class);
        AuthorizationService authorization = new AuthorizationService(memberships);
        User owner = user(1L, "USER");
        User moderator = user(2L, "USER");
        Community managed = community(10L, owner);
        Community elsewhere = community(11L, owner);
        CommunityMembership membership = new CommunityMembership(managed, moderator);
        membership.setRole("MODERATOR");
        when(memberships.findByCommunityIdAndUserId(10L, 2L)).thenReturn(Optional.of(membership));
        when(memberships.findByCommunityIdAndUserId(11L, 2L)).thenReturn(Optional.empty());

        assertTrue(authorization.canModerate(managed, moderator));
        assertFalse(authorization.canModerate(elsewhere, moderator));
    }

    @Test
    void administratorHasGlobalModerationOverride() {
        AuthorizationService authorization = new AuthorizationService(mock(CommunityMembershipRepository.class));
        assertTrue(authorization.canModerate(community(99L, user(1L, "USER")), user(2L, "ADMIN")));
    }

    private User user(Long id, String role) { User user = new User(); user.setId(id); user.setRole(role); return user; }
    private Community community(Long id, User owner) { Community community = new Community("Community " + id, "", owner); community.setId(id); return community; }
}
