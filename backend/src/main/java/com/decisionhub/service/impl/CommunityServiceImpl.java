package com.decisionhub.service.impl;

import com.decisionhub.dto.CommunityRequest;
import com.decisionhub.dto.CommunityResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommunityService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityServiceImpl implements CommunityService {
    private final CommunityRepository communities;
    private final UserRepository users;

    public CommunityServiceImpl(CommunityRepository communities, UserRepository users) {
        this.communities = communities;
        this.users = users;
    }

    @Override
    public CommunityResponse create(CommunityRequest request, String email) {
        Community community = new Community(request.name(), request.description(), users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        return response(communities.save(community));
    }

    @Override
    public List<CommunityResponse> list() { return communities.findAll().stream().map(this::response).toList(); }

    private CommunityResponse response(Community community) {
        return new CommunityResponse(community.getId(), community.getName(), community.getDescription(),
                community.getOwner().getName(), community.getCreatedAt());
    }
}