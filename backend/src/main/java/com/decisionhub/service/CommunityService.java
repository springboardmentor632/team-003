package com.decisionhub.service;

import com.decisionhub.dto.CommunityRequest;
import com.decisionhub.dto.CommunityResponse;
import java.util.List;

public interface CommunityService {
    CommunityResponse create(CommunityRequest request, String email);
    List<CommunityResponse> list();
}