package com.decisionhub.service;

import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityInvitation;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommunityInvitationRepository;
import com.decisionhub.repository.CommunityMembershipRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CommunityServiceTest {
    private CommunityRepository communities;
    private CommunityMembershipRepository memberships;
    private AuthorizationService authorization;
    private UserRepository users;
    private NotificationService notifications;
    private CommunityInvitationRepository invitations;
    private CommunityService communityService;
    private Community community;
    private User owner;
    private User invitee;

    @BeforeEach
    void setUp() {
        communities = mock(CommunityRepository.class);
        memberships = mock(CommunityMembershipRepository.class);
        authorization = mock(AuthorizationService.class);
        users = mock(UserRepository.class);
        notifications = mock(NotificationService.class);
        invitations = mock(CommunityInvitationRepository.class);
        communityService = new CommunityService(communities, memberships, authorization, users, notifications, invitations);

        owner = user(1L, "Owner", "USER");
        invitee = user(2L, "Invitee", "USER");
        community = new Community("Product Builders", "Shared decisions", owner);
        community.setId(10L);
    }

    @Test
    void invite_createsInvitationAndNotifiesInvitee() {
        when(communities.findById(10L)).thenReturn(Optional.of(community));
        when(users.findByEmail(invitee.getEmail())).thenReturn(Optional.of(invitee));
        when(memberships.existsByCommunityIdAndUserId(10L, invitee.getId())).thenReturn(false);

        communityService.invite(10L, invitee.getEmail(), owner);

        verify(authorization).requireCommunityModerator(community, owner);
        verify(invitations).save(any(CommunityInvitation.class));
        verify(notifications).notify(eq(invitee), eq(com.decisionhub.model.NotificationType.COMMUNITY_INVITATION), eq("Owner invited you to Product Builders"), eq(null));
    }

    @Test
    void acceptInvitation_marksAcceptedAndAddsMembership() {
        CommunityInvitation invitation = new CommunityInvitation(community, invitee, owner);
        when(invitations.findById(20L)).thenReturn(Optional.of(invitation));
        when(memberships.existsByCommunityIdAndUserId(10L, invitee.getId())).thenReturn(false);
        when(memberships.countByCommunityId(10L)).thenReturn(1L);
        when(memberships.findByCommunityIdAndUserId(10L, invitee.getId())).thenReturn(Optional.empty());

        Community accepted = communityService.acceptInvitation(20L, invitee);

        assertEquals("ACCEPTED", invitation.getStatus());
        assertEquals(community, accepted);
        verify(invitations).save(invitation);
        verify(memberships).save(any(CommunityMembership.class));
    }

    @Test
    void declineInvitation_marksDeclinedWithoutAddingMembership() {
        CommunityInvitation invitation = new CommunityInvitation(community, invitee, owner);
        when(invitations.findById(21L)).thenReturn(Optional.of(invitation));

        communityService.declineInvitation(21L, invitee);

        assertEquals("DECLINED", invitation.getStatus());
        verify(invitations).save(invitation);
        verify(memberships, never()).save(any(CommunityMembership.class));
    }

    private User user(Long id, String name, String role) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(name.toLowerCase() + "@example.com");
        user.setRole(role);
        return user;
    }
}
