package com.decisionhub.config;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.List;

@Configuration
public class SeedDecisionsConfig {

    @Bean
    @Order(2)
    CommandLineRunner seedDecisions(DecisionRepository decisionRepository, OptionRepository optionRepository) {
        return args -> {
            List<Decision> existing = decisionRepository.findAll();

            // 1. System Admin (ADMIN role) — Governance, Platform & Vendor decisions
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Admin: Cloud migration",
                    "Choose the best path for the next platform infrastructure move.",
                    "System Admin", "Technology", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Move to Azure App Service", "Fastest path to production", "Lower ops load", "Less control", 7, 9, 8, 9, 8),
                            new OptionData("Use Azure Container Apps", "Flexible deployment", "Better scaling", "More configuration", 6, 9, 7, 7, 7),
                            new OptionData("Stay on existing VM setup", "Minimal change", "Familiar environment", "Higher maintenance", 8, 5, 5, 8, 6)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Admin: Team onboarding",
                    "Pick the most effective onboarding program for the next quarter.",
                    "System Admin", "Education", "MULTIPLE_CHOICE", false,
                    List.of(
                            new OptionData("Buddy program", "High engagement", "Easy mentoring", "Needs time from senior staff", 8, 9, 8, 6, 8),
                            new OptionData("Self-paced course", "Flexible", "Scales well", "Lower accountability", 9, 7, 7, 9, 9),
                            new OptionData("Hybrid rollout", "Balanced approach", "Good visibility", "More coordination", 7, 9, 8, 7, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Admin: Vendor shortlist",
                    "Choose the best security & compliance vendor partner for the upcoming rollout.",
                    "System Admin", "Finance", "RATING", true,
                    List.of(
                            new OptionData("Vendor A", "Strong support", "Good pricing", "Less customization", 8, 8, 9, 8, 8),
                            new OptionData("Vendor B", "Best feature set", "Great roadmap", "Higher cost", 5, 9, 8, 7, 7),
                            new OptionData("Vendor C", "Fastest implementation", "Quick onboarding", "Risky long-term support", 7, 6, 4, 9, 8)
                    ));

            // 2. Arjun Mehta (Community Moderator & Engineering Owner) — Architecture & Engineering decisions
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Arjun: API gateway & service mesh",
                    "Select the standard ingress and service-to-service communication layer for microservices.",
                    "Arjun Mehta", "Technology", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Envoy + Istio", "Full mTLS and traffic shaping", "Battle-tested observability", "Steeper learning curve", 6, 9, 8, 5, 6),
                            new OptionData("Kong Gateway", "Rich plugin ecosystem", "Fast setup for REST & gRPC", "Enterprise features cost extra", 7, 8, 8, 8, 8),
                            new OptionData("Spring Cloud Gateway", "Native JVM integration", "Zero new infra binary for Java teams", "Limited non-JVM support", 9, 7, 8, 9, 9)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Arjun: Frontend monorepo tooling",
                    "Rate the build orchestration tools for our shared UI packages and web apps.",
                    "Arjun Mehta", "Technology", "RATING", false,
                    List.of(
                            new OptionData("Turborepo", "Incremental caching", "Minimal config with npm workspaces", "Fewer code-gen plugins", 9, 9, 8, 9, 9),
                            new OptionData("Nx Workspace", "Deep dependency graph", "Powerful generators & affected commands", "Heavier configuration", 7, 9, 7, 6, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Arjun: On-call rotation cadence",
                    "Decide on the fairest incident response rotation model for backend engineers.",
                    "Arjun Mehta", "Lifestyle", "MULTIPLE_CHOICE", true,
                    List.of(
                            new OptionData("Weekly follow-the-sun", "No overnight paging", "Clear weekly handoff", "Requires cross-region sync", 8, 9, 9, 8, 8),
                            new OptionData("Split weekday / weekend shifts", "Shorter blocks", "Predictable weekends", "More frequent handoffs", 8, 7, 7, 7, 7)
                    ));

            // 3. Maya Patel (Community Owner — Product & Travel) — Product strategy & Retreat decisions
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Maya: Q4 product roadmap focus",
                    "We have capacity for one flagship initiative in Q4. Which bet delivers the highest customer impact?",
                    "Maya Patel", "Career", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("AI decision copilot", "Automated option trade-off summaries", "Strong market differentiation", "Inference cost & prompt tuning", 6, 10, 6, 6, 8),
                            new OptionData("Slack & Teams live voting", "Meet users where they already chat", "Immediate viral adoption", "Multi-platform maintenance", 8, 9, 8, 8, 9),
                            new OptionData("Custom weighted templates", "Enterprise decision matrices", "High retention for power users", "Narrower top-of-funnel appeal", 9, 8, 9, 8, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Maya: Design system pricing tier",
                    "Evaluate how we package collaborative analytics and community moderation for growing teams.",
                    "Maya Patel", "Finance", "RATING", false,
                    List.of(
                            new OptionData("Usage-based per active board", "Low barrier to entry", "Scales naturally with value", "Less predictable monthly billing", 8, 9, 7, 8, 8),
                            new OptionData("Flat community seat bundle", "Simple budgeting for buyers", "Predictable ARR", "Higher upfront friction", 7, 8, 8, 9, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Maya: Annual team retreat destination",
                    "Pick the destination for our 4-day product and design strategy offsite.",
                    "Maya Patel", "Travel", "SINGLE_CHOICE", true,
                    List.of(
                            new OptionData("Coorg eco-resort", "Quiet mountain setting", "Great for deep workshops", "3-hour drive from airport", 8, 9, 8, 7, 7),
                            new OptionData("Goa beachfront villa", "Direct flights", "High team energy & beach evenings", "Peak season hotel rates", 6, 8, 8, 9, 9),
                            new OptionData("Jaipur heritage hotel", "Inspiring architecture", "Memorable cultural experience", "Warmer daytime weather", 7, 8, 7, 7, 8)
                    ));

            // 4. Harish (Regular Member USER role) — Personal Career, Travel & Finance decisions
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Harish: Career switch",
                    "Decide which opportunity fits Harish's next move best.",
                    "Harish", "Career", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Senior developer role", "Strong technical growth", "Good salary", "Longer commute", 8, 8, 8, 7, 7),
                            new OptionData("Product lead role", "Broader impact", "Leadership growth", "Less coding", 8, 9, 7, 7, 8),
                            new OptionData("Startup founder track", "High upside", "Autonomy", "Higher risk", 5, 10, 4, 5, 6)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Harish: Travel plan",
                    "Pick the preferred destination for the next break.",
                    "Harish", "Travel", "MULTIPLE_CHOICE", false,
                    List.of(
                            new OptionData("Bali", "Relaxing", "Great food", "Long flight", 7, 9, 8, 6, 8),
                            new OptionData("Paris", "Cultural experience", "Excellent food", "Expensive", 4, 9, 8, 6, 7),
                            new OptionData("Local staycation", "Low stress", "Save money", "Less adventure", 10, 6, 9, 9, 9)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Harish: Budget priority",
                    "Select the best way to spend the next quarterly budget.",
                    "Harish", "Finance", "RATING", true,
                    List.of(
                            new OptionData("Learning budget", "Career upside", "Strong ROI", "Longer payback", 8, 9, 9, 7, 8),
                            new OptionData("Upgrade home setup", "Immediate comfort", "Better focus", "No career gain", 6, 8, 9, 9, 9),
                            new OptionData("Save for future goal", "Low risk", "Financial security", "Lower short-term excitement", 10, 8, 10, 8, 8)
                    ));

            // 5. Priya Nair & Rohan Shah — Workplace Culture & Sustainability decisions
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Priya: Hybrid work policy update",
                    "Choose the core collaboration days policy for the upcoming semester.",
                    "Priya Nair", "Lifestyle", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("2 anchor days (Tue & Thu)", "Predictable in-person syncs", "3 flexible remote days", "Commute on fixed days", 8, 9, 8, 8, 9),
                            new OptionData("Remote-first + monthly week", "Maximum daily flexibility", "Deep quarterly bonding", "Travel logistics once a month", 7, 8, 8, 8, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Rohan: Green office energy plan",
                    "Prioritize our next sustainability initiative for the campus workspace.",
                    "Rohan Shah", "Lifestyle", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Rooftop solar microgrid", "40% lower grid draw", "Strong 3-year payback", "Upfront installation capex", 6, 9, 8, 6, 8),
                            new OptionData("Zero-waste cafeteria & EV chargers", "Visible daily employee benefit", "Fast 6-week rollout", "Smaller carbon reduction", 8, 8, 9, 9, 9)
                    ));
        };
    }

    private void upsertDecision(DecisionRepository decisionRepository,
                                OptionRepository optionRepository,
                                List<Decision> existing,
                                String title,
                                String description,
                                String createdBy,
                                String category,
                                String pollType,
                                boolean closed,
                                List<OptionData> optionDataList) {
        Decision decision = existing.stream()
                .filter(d -> title.equalsIgnoreCase(d.getTitle()))
                .findFirst()
                .orElseGet(Decision::new);

        decision.setTitle(title);
        decision.setDescription(description);
        decision.setCreatedBy(createdBy);
        decision.setCategory(category);
        decision.setVisibility("PUBLIC");
        decision.setPollType(pollType);
        decision.setClosed(closed);
        Decision savedDecision = decisionRepository.save(decision);

        List<Option> currentOptions = optionRepository.findByDecisionId(savedDecision.getId());
        if (currentOptions.isEmpty()) {
            for (OptionData optionData : optionDataList) {
                Option option = new Option();
                applyOptionData(option, optionData, savedDecision);
                optionRepository.save(option);
            }
        } else {
            for (int i = 0; i < currentOptions.size() && i < optionDataList.size(); i++) {
                Option option = currentOptions.get(i);
                OptionData data = optionDataList.get(i);
                if (option.getCostScore() == null) {
                    applyOptionData(option, data, savedDecision);
                    optionRepository.save(option);
                }
            }
        }
    }

    private void applyOptionData(Option option, OptionData data, Decision decision) {
        option.setName(data.name());
        option.setDescription(data.description());
        option.setPros(data.pros());
        option.setCons(data.cons());
        option.setCostScore(data.cost());
        option.setBenefitsScore(data.benefits());
        option.setRiskScore(data.risk());
        option.setTimeScore(data.time());
        option.setConvenienceScore(data.convenience());
        option.setDecision(decision);
    }

    private record OptionData(String name, String description, String pros, String cons,
                              int cost, int benefits, int risk, int time, int convenience) {
    }
}
