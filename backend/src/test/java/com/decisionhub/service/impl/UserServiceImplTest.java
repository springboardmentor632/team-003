package com.decisionhub.service.impl;

import com.decisionhub.dto.UpdateProfileRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EmailAlreadyExistsException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock UserRepository userRepository;

    @Test
    void getProfileReturnsUserDetails() {
        User user = new User("User", "user@example.com", "encoded", Role.ADMIN);
        user.setId(7L);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        UserResponse response = new UserServiceImpl(userRepository).getProfile(user.getEmail());

        assertEquals(7L, response.id());
        assertEquals("User", response.name());
        assertEquals("user@example.com", response.email());
        assertEquals("ADMIN", response.role());
    }

    @Test
    void getProfileThrowsWhenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> new UserServiceImpl(userRepository).getProfile("missing@example.com"));
    }

    @Test
    void updateProfileChangesUserAndSaves() {
        User user = new User("Old", "old@example.com", "encoded", Role.USER);
        when(userRepository.findByEmail("old@example.com")).thenReturn(Optional.of(user));

        UserResponse response = new UserServiceImpl(userRepository).updateProfile(
                "old@example.com", new UpdateProfileRequest("New", "new@example.com"));

        verify(userRepository).save(user);
        assertEquals("New", response.name());
        assertEquals("new@example.com", response.email());
        assertNotNull(response.updatedAt());
    }

    @Test
    void updateProfileRejectsEmailUsedByAnotherUser() {
        User user = new User("User", "old@example.com", "encoded", Role.USER);
        when(userRepository.findByEmail("old@example.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class,
                () -> new UserServiceImpl(userRepository).updateProfile(
                        "old@example.com", new UpdateProfileRequest("User", "taken@example.com")));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfileAllowsKeepingCurrentEmail() {
        User user = new User("User", "user@example.com", "encoded", Role.USER);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        new UserServiceImpl(userRepository).updateProfile(
                "user@example.com", new UpdateProfileRequest("Renamed", "user@example.com"));

        verify(userRepository).save(any(User.class));
        verify(userRepository, never()).existsByEmail(anyString());
    }
}