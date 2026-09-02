package com.decisionhub.service;

import com.decisionhub.dto.AuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
