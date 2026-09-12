package com.decisionhub.config;

import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@decisionhub.local")) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@decisionhub.local");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            if (!userRepository.existsByEmail("harish@decisionhub.local")) {
                User harish = new User();
                harish.setName("Harish");
                harish.setEmail("harish@decisionhub.local");
                harish.setPassword(passwordEncoder.encode("harish123"));
                harish.setRole("USER");
                userRepository.save(harish);
            }
        };
    }
}
