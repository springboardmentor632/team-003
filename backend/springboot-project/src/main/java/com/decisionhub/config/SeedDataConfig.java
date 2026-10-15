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
            upsertDemoUser(userRepository, passwordEncoder, "System Admin", "admin@decisionhub.local", "demo123", "ADMIN");
            upsertDemoUser(userRepository, passwordEncoder, "Harish", "harish@decisionhub.local", "demo123", "USER");
            upsertDemoUser(userRepository, passwordEncoder, "Maya Patel", "maya@decisionhub.local", "demo123", "USER");
            upsertDemoUser(userRepository, passwordEncoder, "Arjun Mehta", "arjun@decisionhub.local", "demo123", "USER");
            upsertDemoUser(userRepository, passwordEncoder, "Priya Nair", "priya@decisionhub.local", "demo123", "USER");
            upsertDemoUser(userRepository, passwordEncoder, "Rohan Shah", "rohan@decisionhub.local", "demo123", "USER");
        };
    }

    private void upsertDemoUser(UserRepository users, PasswordEncoder encoder, String name, String email, String password, String role) {
        User existing = users.findByEmail(email).orElse(null);
        if (existing == null) {
            users.save(new User(name, email, encoder.encode(password), role));
            return;
        }
        if (!encoder.matches(password, existing.getPassword())) {
            existing.setPassword(encoder.encode(password));
            users.save(existing);
        }
    }
}
