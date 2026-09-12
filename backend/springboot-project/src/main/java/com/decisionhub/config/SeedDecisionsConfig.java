package com.decisionhub.config;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SeedDecisionsConfig {

    @Bean
    CommandLineRunner seedDecisions(DecisionRepository decisionRepository, OptionRepository optionRepository) {
        return args -> {
            if (decisionRepository.count() > 0) {
                return;
            }

            createDecision(decisionRepository, optionRepository,
                    "Admin: Cloud migration",
                    "Choose the best path for the next platform move.",
                    "System Admin",
                    List.of(
                            new OptionData("Move to Azure App Service", "Fastest path to production", "Lower ops load", "Less control"),
                            new OptionData("Use Azure Container Apps", "Flexible deployment", "Better scaling", "More configuration"),
                            new OptionData("Stay on existing VM setup", "Minimal change", "Familiar environment", "Higher maintenance")
                    ));

            createDecision(decisionRepository, optionRepository,
                    "Admin: Team onboarding",
                    "Pick the most effective onboarding program for the next quarter.",
                    "System Admin",
                    List.of(
                            new OptionData("Buddy program", "High engagement", "Easy mentoring", "Needs time from senior staff"),
                            new OptionData("Self-paced course", "Flexible", "Scales well", "Lower accountability"),
                            new OptionData("Hybrid rollout", "Balanced approach", "Good visibility", "More coordination")
                    ));

            createDecision(decisionRepository, optionRepository,
                    "Admin: Vendor shortlist",
                    "Choose the best vendor partner for the upcoming rollout.",
                    "System Admin",
                    List.of(
                            new OptionData("Vendor A", "Strong support", "Good pricing", "Less customization"),
                            new OptionData("Vendor B", "Best feature set", "Great roadmap", "Higher cost"),
                            new OptionData("Vendor C", "Fastest implementation", "Quick onboarding", "Risky long-term support")
                    ));

            createDecision(decisionRepository, optionRepository,
                    "Harish: Career switch",
                    "Decide which opportunity fits Harish's next move best.",
                    "Harish",
                    List.of(
                            new OptionData("Senior developer role", "Strong technical growth", "Good salary", "Longer commute"),
                            new OptionData("Product lead role", "Broader impact", "Leadership growth", "Less coding"),
                            new OptionData("Startup founder track", "High upside", "Autonomy", "Higher risk")
                    ));

            createDecision(decisionRepository, optionRepository,
                    "Harish: Travel plan",
                    "Pick the preferred destination for the next break.",
                    "Harish",
                    List.of(
                            new OptionData("Bali", "Relaxing", "Great food", "Long flight"),
                            new OptionData("Paris", "Cultural experience", "Excellent food", "Expensive"),
                            new OptionData("Local staycation", "Low stress", "Save money", "Less adventure")
                    ));

            createDecision(decisionRepository, optionRepository,
                    "Harish: Budget priority",
                    "Select the best way to spend the next quarterly budget.",
                    "Harish",
                    List.of(
                            new OptionData("Learning budget", "Career upside", "Strong ROI", "Longer payback"),
                            new OptionData("Upgrade home setup", "Immediate comfort", "Better focus", "No career gain"),
                            new OptionData("Save for future goal", "Low risk", "Financial security", "Lower short-term excitement")
                    ));
        };
    }

    private void createDecision(DecisionRepository decisionRepository,
                               OptionRepository optionRepository,
                               String title,
                               String description,
                               String createdBy,
                               List<OptionData> optionDataList) {
        DecisionRequest request = new DecisionRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setCreatedBy(createdBy);

        Decision decision = new Decision();
        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setCreatedBy(request.getCreatedBy());
        Decision savedDecision = decisionRepository.save(decision);

        for (OptionData optionData : optionDataList) {
            Option option = new Option();
            option.setName(optionData.name());
            option.setDescription(optionData.description());
            option.setPros(optionData.pros());
            option.setCons(optionData.cons());
            option.setDecision(savedDecision);
            optionRepository.save(option);
        }
    }

    private record OptionData(String name, String description, String pros, String cons) {
    }
}
