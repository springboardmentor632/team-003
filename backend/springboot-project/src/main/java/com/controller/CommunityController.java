package com.decisionhub.controller;

import com.decisionhub.dto.CommunityRequest;
import com.decisionhub.model.Community;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommunityService;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin(origins = "*")
public class CommunityController {
    private final CommunityService communities; private final UserRepository users;
    public CommunityController(CommunityService communities, UserRepository users) { this.communities = communities; this.users = users; }
    @GetMapping public List<Community> list() { return communities.list(current()); }
    @PostMapping public Community create(@RequestBody CommunityRequest request) { return communities.create(request, current()); }
    @GetMapping("/{id}") public Community get(@PathVariable Long id) { return communities.get(id, current()); }
    @PutMapping("/{id}") public Community update(@PathVariable Long id, @RequestBody CommunityRequest request) { return communities.update(id, request, current()); }
    @PostMapping("/{id}/members") public Community join(@PathVariable Long id) { return communities.join(id, current()); }
    @DeleteMapping("/{id}/members/me") public Community leave(@PathVariable Long id) { return communities.leave(id, current()); }
    @PutMapping("/{id}/members/{memberId}/role") public Community setMemberRole(@PathVariable Long id, @PathVariable Long memberId, @RequestParam String role) { return communities.setMemberRole(id, memberId, role, current()); }
    @PostMapping("/{id}/invitations") public java.util.Map<String, String> invite(@PathVariable Long id, @RequestParam String email) { communities.invite(id, email, current()); return java.util.Map.of("message", "Invitation sent"); }
    @GetMapping("/invitations") public java.util.List<com.decisionhub.model.CommunityInvitation> invitations() { return communities.invitations(current()); }
    @PostMapping("/invitations/{id}/accept") public Community accept(@PathVariable Long id) { return communities.acceptInvitation(id, current()); }
    @PostMapping("/invitations/{id}/decline") public java.util.Map<String,String> decline(@PathVariable Long id) { communities.declineInvitation(id, current()); return java.util.Map.of("message", "Invitation declined"); }
    private User current() { return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new IllegalArgumentException("User not found")); }
}
