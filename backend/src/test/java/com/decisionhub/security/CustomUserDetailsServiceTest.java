package com.decisionhub.security;

import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock UserRepository userRepository;

    @Test
    void loadsUserDetailsWithRoleAuthority() {
        User user = new User("User", "user@example.com", "encoded", Role.ADMIN);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        CustomUserDetails details = (CustomUserDetails) new CustomUserDetailsService(userRepository)
                .loadUserByUsername(user.getEmail());

        assertEquals(user.getEmail(), details.getUsername());
        assertEquals(user.getPassword(), details.getPassword());
        assertEquals("User", details.getName());
        assertTrue(details.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(details.isEnabled());
    }

    @Test
    void throwsWhenEmailIsNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> new CustomUserDetailsService(userRepository).loadUserByUsername("missing@example.com"));
    }
}