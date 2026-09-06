package com.decisionhub.service;

import com.decisionhub.dto.UpdateProfileRequest;
import com.decisionhub.dto.UserResponse;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
}
