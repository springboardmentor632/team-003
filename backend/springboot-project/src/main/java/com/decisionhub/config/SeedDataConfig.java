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
            createIfMissing(userRepository, passwordEncoder, "System Admin", "admin@decisionhub.local", "admin123", "ADMIN");
            createIfMissing(userRepository, passwordEncoder, "Harish", "harish@decisionhub.local", "harish123", "USER");
            createIfMissing(userRepository, passwordEncoder, "Maya Patel", "maya@decisionhub.local", "demo123", "USER");
            createIfMissing(userRepository, passwordEncoder, "Arjun Mehta", "arjun@decisionhub.local", "demo123", "USER");
            createIfMissing(userRepository, passwordEncoder, "Priya Nair", "priya@decisionhub.local", "demo123", "USER");
            createIfMissing(userRepository, passwordEncoder, "Rohan Shah", "rohan@decisionhub.local", "demo123", "USER");
        };
    }

    private void createIfMissing(UserRepository users, PasswordEncoder encoder, String name, String email, String password, String role) {
        if (users.existsByEmail(email)) return;
        users.save(new User(name, email, encoder.encode(password), role));
    }
}
