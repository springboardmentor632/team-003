package com.decisionhub.service;

import com.decisionhub.dto.CommunityRequest;
import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.User;
import com.decisionhub.repository.CommunityMembershipRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.CommunityInvitationRepository;
import com.decisionhub.model.CommunityInvitation;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommunityService {
    private final CommunityRepository communities;
    private final CommunityMembershipRepository memberships;
    private final AuthorizationService authorization;
    private final UserRepository users;
    private final NotificationService notifications;
    private final CommunityInvitationRepository invitations;
    public CommunityService(CommunityRepository communities, CommunityMembershipRepository memberships, AuthorizationService authorization, UserRepository users, NotificationService notifications, CommunityInvitationRepository invitations) { this.communities = communities; this.memberships = memberships; this.authorization = authorization; this.users = users; this.notifications = notifications; this.invitations = invitations; }
    @Transactional
    public Community create(CommunityRequest request, User owner) {
        if (request.getName() == null || request.getName().isBlank()) throw new IllegalArgumentException("Community name is required");
        if (communities.existsByName(request.getName())) throw new IllegalArgumentException("That community name is already used");
        Community community = communities.save(new Community(request.getName().trim(), request.getDescription(), owner));
        CommunityMembership ownerMembership = new CommunityMembership(community, owner);
        ownerMembership.setRole("OWNER");
        memberships.save(ownerMembership);
        return decorate(community, owner);
    }
    @Transactional(readOnly = true)
    public List<Community> list(User viewer) { return communities.findAll().stream().map(c -> decorate(c, viewer)).toList(); }
    @Transactional(readOnly = true)
    public Community get(Long id, User viewer) { return decorate(raw(id), viewer); }
    @Transactional
    public Community join(Long id, User user) {
        Community community = raw(id);
        if (!memberships.existsByCommunityIdAndUserId(id, user.getId())) memberships.save(new CommunityMembership(community, user));
        return decorate(community, user);
    }
    @Transactional
    public Community leave(Long id, User user) {
        Community community = raw(id);
        if (community.getOwner().getId().equals(user.getId())) throw new IllegalStateException("The owner cannot leave their community");
        memberships.deleteByCommunityIdAndUserId(id, user.getId());
        return decorate(community, user);
    }
    @Transactional
    public Community update(Long id, CommunityRequest request, User user) {
        Community community = raw(id);
        authorization.requireCommunityModerator(community, user);
        if (request.getName() != null && !request.getName().isBlank()) community.setName(request.getName().trim());
        if (request.getDescription() != null) community.setDescription(request.getDescription());
        return decorate(communities.save(community), user);
    }
    @Transactional
    public Community setMemberRole(Long communityId, Long memberId, String role, User actor) {
        Community community = raw(communityId);
        if (!authorization.isAdmin(actor) && !community.getOwner().getId().equals(actor.getId())) {
            throw new SecurityException("Only the community owner or an admin can assign moderator roles");
        }
        if (!"MEMBER".equalsIgnoreCase(role) && !"MODERATOR".equalsIgnoreCase(role)) throw new IllegalArgumentException("Role must be MEMBER or MODERATOR");
        CommunityMembership membership = memberships.findByCommunityIdAndUserId(communityId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a community member"));
        if (community.getOwner().getId().equals(memberId)) throw new IllegalArgumentException("The community owner role cannot be changed");
        membership.setRole(role.toUpperCase());
        memberships.save(membership);
        return decorate(community, actor);
    }
    @Transactional
    public void invite(Long communityId, String email, User actor) {
        Community community = raw(communityId); authorization.requireCommunityModerator(community, actor);
        User invitee = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!memberships.existsByCommunityIdAndUserId(communityId, invitee.getId())) {
            invitations.save(new CommunityInvitation(community, invitee, actor));
            notifications.notify(invitee, com.decisionhub.model.NotificationType.COMMUNITY_INVITATION, actor.getName() + " invited you to " + community.getName(), null);
        }
    }
    @Transactional public List<CommunityInvitation> invitations(User user) { return invitations.findByInviteeIdAndStatus(user.getId(), "PENDING"); }
    @Transactional public Community acceptInvitation(Long invitationId, User user) {
        CommunityInvitation invitation = invitations.findById(invitationId).orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        if (!invitation.getInvitee().getId().equals(user.getId()) || !"PENDING".equals(invitation.getStatus())) throw new SecurityException("Invitation cannot be accepted");
        invitation.setStatus("ACCEPTED"); invitations.save(invitation); if (!memberships.existsByCommunityIdAndUserId(invitation.getCommunity().getId(), user.getId())) memberships.save(new CommunityMembership(invitation.getCommunity(), user)); return decorate(invitation.getCommunity(), user);
    }
    @Transactional public void declineInvitation(Long invitationId, User user) { CommunityInvitation invitation = invitations.findById(invitationId).orElseThrow(() -> new IllegalArgumentException("Invitation not found")); if (!invitation.getInvitee().getId().equals(user.getId()) || !"PENDING".equals(invitation.getStatus())) throw new SecurityException("Invitation cannot be declined"); invitation.setStatus("DECLINED"); invitations.save(invitation); }
    private Community raw(Long id) { return communities.findById(id).orElseThrow(() -> new IllegalArgumentException("Community not found")); }
    private Community decorate(Community community, User viewer) {
        community.setMemberCount(memberships.countByCommunityId(community.getId()));
        CommunityMembership membership = viewer == null ? null : memberships.findByCommunityIdAndUserId(community.getId(), viewer.getId()).orElse(null);
        community.setJoined(membership != null);
        community.setMemberRole(membership == null ? null : membership.getRole());
        return community;
    }
}
