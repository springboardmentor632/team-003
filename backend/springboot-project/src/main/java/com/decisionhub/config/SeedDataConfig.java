package com.decisionhub.config;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {

    @Bean
    @Order(1)
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            upsertDemoUser(userRepository, passwordEncoder, "System Admin", "admin@decisionhub.local", "demo123", "ADMIN", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            upsertDemoUser(userRepository, passwordEncoder, "Harish", "harish@decisionhub.local", "demo123", "USER", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80");
            upsertDemoUser(userRepository, passwordEncoder, "Maya Patel", "maya@decisionhub.local", "demo123", "USER", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80");
            upsertDemoUser(userRepository, passwordEncoder, "Arjun Mehta", "arjun@decisionhub.local", "demo123", "USER", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
            upsertDemoUser(userRepository, passwordEncoder, "Priya Nair", "priya@decisionhub.local", "demo123", "USER", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
            upsertDemoUser(userRepository, passwordEncoder, "Rohan Shah", "rohan@decisionhub.local", "demo123", "USER", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80");
        };
    }

    private void upsertDemoUser(UserRepository users, PasswordEncoder encoder, String name, String email, String password, String role, String avatarUrl) {
        User existing = users.findByEmail(email).orElse(null);
        if (existing == null) {
            User user = new User(name, email, encoder.encode(password), role);
            user.setAvatarUrl(avatarUrl);
            users.save(user);
            return;
        }
        boolean updated = false;
        if (!encoder.matches(password, existing.getPassword())) {
            existing.setPassword(encoder.encode(password));
            updated = true;
        }
        if (existing.getAvatarUrl() == null || existing.getAvatarUrl().isBlank()) {
            existing.setAvatarUrl(avatarUrl);
            updated = true;
        }
        if (updated) {
            users.save(existing);
        }
    }
}
