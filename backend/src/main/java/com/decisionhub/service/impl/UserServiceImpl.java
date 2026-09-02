package com.decisionhub.service.impl;

import com.decisionhub.dto.UpdateProfileRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EmailAlreadyExistsException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.UserService;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getCreatedAt(), user.getUpdatedAt());
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        user.setName(request.name());
        user.setEmail(request.email());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getCreatedAt(), user.getUpdatedAt());
    }
}
