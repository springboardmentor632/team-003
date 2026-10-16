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
            upsertDemoUser(userRepository, passwordEncoder, "System Admin", "admin@decisionhub.local", "demo123", "ADMIN", "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBot&backgroundColor=b6e3f4");
            upsertDemoUser(userRepository, passwordEncoder, "Harish", "harish@decisionhub.local", "demo123", "USER", "https://api.dicebear.com/7.x/avataaars/svg?seed=HarishDev&backgroundColor=c0aede");
            upsertDemoUser(userRepository, passwordEncoder, "Maya Patel", "maya@decisionhub.local", "demo123", "USER", "https://api.dicebear.com/7.x/avataaars/svg?seed=MayaLeader&backgroundColor=ffd5dc");
            upsertDemoUser(userRepository, passwordEncoder, "Arjun Mehta", "arjun@decisionhub.local", "demo123", "USER", "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMod&backgroundColor=d1d4f9");
            upsertDemoUser(userRepository, passwordEncoder, "Priya Nair", "priya@decisionhub.local", "demo123", "USER", "https://api.dicebear.com/7.x/micah/svg?seed=PriyaDesigner&backgroundColor=ffdfbf");
            upsertDemoUser(userRepository, passwordEncoder, "Rohan Shah", "rohan@decisionhub.local", "demo123", "USER", "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanArchitect&backgroundColor=c7f9cc");
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
