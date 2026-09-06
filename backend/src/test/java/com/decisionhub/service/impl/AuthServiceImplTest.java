package com.decisionhub.service.impl;

import com.decisionhub.dto.AuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EmailAlreadyExistsException;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    private AuthServiceImpl service() {
        return new AuthServiceImpl(userRepository, new BCryptPasswordEncoder(), authenticationManager, jwtService);
    }

    @Test
    void registerSavesUserAndReturnsProfile() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

        AuthResponse response = service().register(new RegisterRequest("New User", "new@example.com", "password123"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("New User", response.name());
        assertEquals("new@example.com", response.email());
        assertEquals("USER", response.role());
        assertTrue(new BCryptPasswordEncoder().matches("password123", captor.getValue().getPassword()));
    }

    @Test
    void registerRejectsExistingEmail() {
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class,
                () -> service().register(new RegisterRequest("User", "existing@example.com", "password123")));
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginAuthenticatesAndReturnsToken() {
        User user = new User("User", "user@example.com", "encoded", Role.USER);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user.getEmail(), "USER")).thenReturn("token");

        AuthResponse response = service().login(new LoginRequest(user.getEmail(), "password123"));

        assertEquals("token", response.token());
        assertEquals(user.getName(), response.name());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void loginRejectsAuthenticationFailure() {
        doThrow(new RuntimeException("bad credentials")).when(authenticationManager).authenticate(any());

        assertThrows(BadCredentialsException.class,
                () -> service().login(new LoginRequest("user@example.com", "wrong")));
        verifyNoInteractions(userRepository, jwtService);
    }

    @Test
    void loginRejectsMissingUserAfterAuthentication() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class,
                () -> service().login(new LoginRequest("missing@example.com", "password123")));
        verifyNoInteractions(jwtService);
    }
}