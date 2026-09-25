package com.decisionhub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaMigrationConfig {
    @Bean
    @Order(1)
    CommandLineRunner addCommentHiddenColumn(JdbcTemplate jdbc) {
        return args -> {
            jdbc.execute("ALTER TABLE comments ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE");
            jdbc.update("UPDATE comments SET hidden = FALSE WHERE hidden IS NULL");
            jdbc.execute("ALTER TABLE comments ALTER COLUMN hidden SET DEFAULT FALSE");
            jdbc.execute("ALTER TABLE comments ALTER COLUMN hidden SET NOT NULL");
        };
    }
}