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

            // 1. System Admin (ADMIN role) — Platform Governance, Infrastructure & Security
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Enterprise Cloud Hosting & Multi-Region Resiliency",
                    "Admin: Cloud migration",
                    "Select the primary cloud architecture for DecisionHub's multi-region SLA (99.99% uptime), data residency compliance, and disaster recovery.",
                    "System Admin", "Technology", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Multi-Region AWS with EKS & Aurora Global", "Active-active clustering across US-East and EU-West", "Sub-second automated failover & FedRAMP certified", "Higher cloud infrastructure spend & multi-region VPC peering", 6, 10, 8, 7, 8),
                            new OptionData("Azure Kubernetes Service (AKS) with Azure SQL", "Enterprise Microsoft cloud integration", "Pre-negotiated M365 enterprise pricing & native Entra ID tie-in", "Cross-region active-active failover requires manual intervention", 7, 9, 8, 8, 8),
                            new OptionData("Serverless Container Apps with Managed Edge", "Fast autoscaling on Cloudflare / Container Apps", "Lowest idle cost and zero node maintenance", "Cold-start latencies on bursty deliberation spikes", 9, 7, 7, 9, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Enterprise SSO & Zero-Trust Identity Standard",
                    "Admin: Team onboarding",
                    "Mandate organization-wide authentication standards, SAML 2.0 / SCIM directory sync, and automated offboarding controls.",
                    "System Admin", "Technology", "MULTIPLE_CHOICE", false,
                    List.of(
                            new OptionData("Okta Workforce Identity Cloud", "Enterprise directory sync and SAML federation", "Gold standard SCIM automation, rich compliance audit logs", "Higher per-user monthly licensing fee", 6, 10, 9, 9, 9),
                            new OptionData("Microsoft Entra ID Federation", "Zero-cost tier for existing M365 tenants", "Bundled with existing enterprise license, zero procurement friction", "Custom multi-tenant external guest workflows require Azure AD B2B config", 9, 9, 8, 8, 8),
                            new OptionData("FIDO2 Hardware Security Keys (YubiKey)", "Strict physical token authentication", "Immune to phishing and credential stuffing attacks", "Physical key distribution & replacement logistics for remote staff", 7, 8, 10, 6, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "AI Model Data Privacy & Sovereign Training Policy",
                    "Admin: Vendor shortlist",
                    "Adopt contractual data protections ensuring customer deliberation transcripts and community votes are never used for public LLM training.",
                    "System Admin", "Finance", "RATING", true,
                    List.of(
                            new OptionData("Zero Data Retention (ZDR) Enterprise API Agreement", "Legally binding zero-logging SLA with SOC-2 compliance", "Guaranteed data isolation with zero customer data retained or trained on", "Requires minimum annual API spend commitment", 8, 10, 9, 9, 9),
                            new OptionData("Dedicated Single-Tenant Model Gateway", "Isolated model weights and dedicated throughput", "Predictable latency and custom compliance controls", "High base provisioned throughput cost even during low hours", 5, 9, 8, 7, 7),
                            new OptionData("Self-Hosted Llama 3 on Private Bare-Metal VPC", "Complete sovereign control over weights and inferencing", "Zero data leaves the corporate perimeter", "Requires specialized on-call ML infrastructure engineering team", 6, 7, 7, 5, 6)
                    ));

            // 2. Arjun Mehta (Community Moderator & Engineering Owner) — Architecture & Developer Experience
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Microservices Ingress Gateway & Service Mesh Architecture",
                    "Arjun: API gateway & service mesh",
                    "Select the standard ingress routing, mTLS encryption layer, and traffic telemetry gateway for our containerized services.",
                    "Arjun Mehta", "Technology", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Envoy Gateway + Ambient Istio Mesh", "Sidecar-less service mesh architecture", "Low memory overhead with transparent mTLS & distributed tracing", "Relatively new specification with evolving operator tooling", 7, 10, 8, 7, 8),
                            new OptionData("Kong Enterprise Gateway", "Plugin-driven API gateway with native Kubernetes CRDs", "Vibrant plugin ecosystem, intuitive web UI, and fast team onboarding", "Enterprise rate limiting and security plugins require paid tier", 6, 8, 9, 9, 9),
                            new OptionData("Spring Cloud Gateway on Native GraalVM", "JVM-native microservices ingress", "Zero third-party infrastructure binary and fast cold starts", "Limited ecosystem for non-JVM polyglot microservices", 9, 7, 8, 9, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "AI Inference Engine for Automated Deliberation Summaries",
                    "Arjun: Frontend monorepo tooling",
                    "Evaluate AI inference backends for real-time discussion thread consensus synthesis, trade-off clustering, and sentiment analytics.",
                    "Arjun Mehta", "Technology", "RATING", false,
                    List.of(
                            new OptionData("Dual Claude 3.5 Sonnet + Gemini Flash Pipeline", "Hybrid high-reasoning and low-latency API tier", "Exceptional synthesis of nuanced debates with sub-second preliminary summaries", "Multi-provider API key management and token budgeting", 8, 10, 8, 8, 9),
                            new OptionData("Self-Hosted vLLM on AWS Inferentia2", "Dedicated private inference cluster", "Flat predictable monthly cost and low-latency internal network calls", "Requires engineering time for quantization testing and GPU cluster autoscaling", 7, 8, 7, 6, 6),
                            new OptionData("Local Edge On-Device WebLLM", "Browser-based WebGPU client inference", "Zero backend API cost and 100% client-side privacy", "Constrained by user machine GPU capacity and initial model download size", 9, 6, 6, 7, 5)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Engineering Incident Response & On-Call Fair Rotation",
                    "Arjun: On-call rotation cadence",
                    "Establish a sustainable, burnout-free incident management rotation model and compensatory time-off schedule for backend engineers.",
                    "Arjun Mehta", "Lifestyle", "MULTIPLE_CHOICE", true,
                    List.of(
                            new OptionData("Follow-the-Sun Global Handover", "Three regional teams (APAC, EMEA, Americas)", "Zero overnight waking pages; handoffs happen during daytime working hours", "Requires disciplined daily async handoff notes and cross-timezone sync", 8, 10, 9, 8, 9),
                            new OptionData("Primary + Secondary Split Weekday/Weekend Shifts", "Shorter 3-to-4 day shifts with 1.5x compensatory days", "Predictable weekends and faster recovery time between shifts", "More frequent context switching across the engineering team", 8, 7, 7, 7, 7)
                    ));

            // 3. Maya Patel (Community Owner — Product Builders & Weekend Explorers) — Roadmap & Offsites
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Q4 Product Strategy: Real-Time Deliberation vs Native Chat Bots",
                    "Maya: Q4 product roadmap focus",
                    "Prioritize our flagship engineering initiative for Q4 to maximize community engagement, viral team adoption, and user retention.",
                    "Maya Patel", "Career", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Real-Time Collaborative Deliberation Canvas", "Interactive multi-player decision canvas", "Live interactive trade-off mapping, instant voting, and animated radar charts", "High WebSocket concurrency and real-time conflict resolution complexity", 6, 10, 7, 6, 8),
                            new OptionData("Native Slack & Microsoft Teams Deliberation Apps", "In-channel interactive decision polls and proposals", "Brings voting directly into daily channels with zero user onboarding friction", "Subject to third-party app store approval delays and UI constraints", 8, 9, 8, 8, 9),
                            new OptionData("AI Consensus Synthesizer & Linear/GitHub Exporter", "Automated decision-to-ticket conversion", "Turns concluded deliberation outcomes into actionable engineering backlog items", "Requires structured prompt safety guardrails to prevent hallucinated tasks", 7, 8, 8, 8, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "SaaS Pricing Architecture: Community Tiers & Pro Features",
                    "Maya: Design system pricing tier",
                    "Structure subscription packages for scaling communities transitioning from public grassroots boards to private organizational governance.",
                    "Maya Patel", "Finance", "RATING", false,
                    List.of(
                            new OptionData("Freemium Public Communities + $12/Seat Enterprise Pro", "Free for open-source & civic groups; pro seats for businesses", "Drives viral community discovery while capturing predictable corporate software budget", "Free tier infrastructure subsidization requires proactive moderation monitoring", 8, 9, 8, 9, 8),
                            new OptionData("Usage-Based Active Participant Metering", "Pay $0.50 per active voting participant each month", "Low barrier to entry for small clubs; costs scale strictly with platform engagement", "Monthly invoice variability can complicate enterprise procurement approval", 7, 8, 7, 8, 7)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Annual Product & Design Strategy Retreat Destination",
                    "Maya: Annual team retreat destination",
                    "Select the destination for our 4-day annual team summit combining intensive product strategy workshops and collaborative outdoor activities.",
                    "Maya Patel", "Travel", "SINGLE_CHOICE", true,
                    List.of(
                            new OptionData("Coorg Coffee Hills Eco-Resort", "Secluded mountain estate with private workshop cabins", "Tranquil natural environment ideal for uninterrupted strategic focus", "Requires 3.5-hour scenic coach ride from nearest international airport", 8, 9, 8, 7, 7),
                            new OptionData("Goa Beachfront Innovation Villa", "Private coastal workspace with high-speed fiber", "Direct flights from major cities, energetic creative vibe, and team beach dinners", "Higher peak season flight and lodging rates", 6, 8, 8, 9, 9),
                            new OptionData("Udaipur Lakeside Heritage Palace", "Inspiring historic architecture on Lake Pichola", "Culturally immersive setting sparking creative design thinking", "Warmer afternoon temperatures during outdoor activity windows", 7, 8, 7, 7, 8)
                    ));

            // 4. Harish (Regular Member USER role) — Career Evolution, Workcations & Personal Growth
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Career Trajectory: Staff Technical Lead vs Engineering Management",
                    "Harish: Career switch",
                    "Decide between individual contributor technical architecture mastery and the engineering people leadership track for long-term impact.",
                    "Harish", "Career", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Staff Principal Architect Track", "Lead multi-team systems architecture & technical RFCs", "Deep hands-on technical leverage, cross-team design authority, and minimal direct reports", "Demands continuous self-directed learning to stay ahead of architectural shifts", 8, 10, 7, 8, 8),
                            new OptionData("Engineering Manager Track", "Lead and mentor a team of 8 senior engineers", "Broad organizational influence, team culture shaping, and executive visibility", "Significant reduction in code commits and increased operational calendar syncs", 8, 8, 8, 7, 7),
                            new OptionData("Founding Engineer at High-Growth Series A", "Join early-stage startup with equity stake", "Extreme product autonomy, massive potential financial upside, and rapid career acceleration", "Higher startup volatility and longer hours during initial product launch sprints", 5, 9, 5, 6, 6)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Quarterly Team Workcation Destination",
                    "Harish: Travel plan",
                    "Pick our community's collaborative workcation destination for a month of productive co-working and cultural discovery.",
                    "Harish", "Travel", "MULTIPLE_CHOICE", false,
                    List.of(
                            new OptionData("Bali Canggu Digital Nomad Hub", "Tropical co-living campus with 500Mbps fiber", "Vibrant tech creator community, low cost of living, and healthy lifestyle activities", "Long flight connection times for Western European and US colleagues", 8, 9, 8, 6, 8),
                            new OptionData("Lisbon Tech Oasis", "Historic European tech capital on the Atlantic coast", "Optimal timezone bridge between US and Asia, walkable city, and vibrant meetup scene", "Higher peak European summer lodging prices", 6, 9, 8, 8, 9),
                            new OptionData("Kyoto Sustainable Craft & Tech Quarter", "Blends ancient Japanese tradition with modern tech hubs", "Immaculate public transit, peaceful working shrines, and extraordinary cultural depth", "Stricter noise etiquette standards in shared working spaces", 7, 8, 9, 7, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Annual Professional Growth & Home Lab Budget Allocation",
                    "Harish: Budget priority",
                    "Determine the highest-return investment for the annual $2,500 professional development and home lab stipend.",
                    "Harish", "Finance", "RATING", true,
                    List.of(
                            new OptionData("Cloud Architecture Certifications & Learning Subscriptions", "AWS Solution Architect Pro + CKA certifications + O'Reilly Library", "Verifiable industry credentials and immediate practical system design mastery", "Requires disciplined evening and weekend self-study commitment", 9, 10, 9, 7, 8),
                            new OptionData("Ergonomic Standing Desk, Herman Miller Embody & Dual 4K Displays", "Premium physical workspace overhaul", "Immediate physical comfort, reduced strain, and sustained daily concentration", "One-off hardware improvement with no direct resume credential accretion", 7, 8, 9, 9, 9),
                            new OptionData("Executive Communication Coaching & Public Speaking Masterclass", "1-on-1 coaching for technical presentations and conference keynotes", "High long-term career dividend for executive presence and stakeholder persuasion", "Difficult to objectively quantify ROI in the short term", 6, 8, 8, 8, 7)
                    ));

            // 5. Priya Nair & Rohan Shah — Workplace Culture & Environmental Sustainability
            upsertDecision(decisionRepository, optionRepository, existing,
                    "Hybrid Collaboration Policy: Anchor Days vs Distributed Months",
                    "Priya: Hybrid work policy update",
                    "Define the team's long-term flexible working rhythm to optimize creative in-person brainstorming while preserving deep remote focus.",
                    "Priya Nair", "Lifestyle", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Two Anchor Days Weekly (Tuesday & Thursday)", "Predictable in-person collaboration cadence", "Guaranteed alignment for sprint planning and design sprints with 3 flexible remote days", "Commuter transit congestion on peak anchor weekdays", 8, 9, 8, 8, 9),
                            new OptionData("Quarterly Co-Location Weeks + 100% Remote", "Teams gather for 4 intensive on-site weeks per year", "Maximum day-to-day geographic freedom for employees across any timezone", "Requires high travel budget and complex booking coordination once a quarter", 7, 8, 8, 7, 8)
                    ));

            upsertDecision(decisionRepository, optionRepository, existing,
                    "Campus Sustainability: Rooftop Solar Microgrid vs Zero-Waste Program",
                    "Rohan: Green office energy plan",
                    "Select the marquee green campus initiative for DecisionHub's facilities to reduce carbon footprint and lead sustainable workplace practices.",
                    "Rohan Shah", "Lifestyle", "SINGLE_CHOICE", false,
                    List.of(
                            new OptionData("Rooftop Solar Photovoltaic Microgrid & Battery Storage", "120kW solar installation covering 45% of building energy load", "Significant ongoing electricity cost savings and 3.5-year ROI payback", "Initial capital expenditure and structural roof reinforcement assessment", 6, 10, 8, 6, 8),
                            new OptionData("Comprehensive Zero-Waste Cafeteria & Composting Loop", "100% elimination of single-use plastics and local farm composting", "High daily visibility for employees and immediate engagement across all teams", "Requires ongoing contractor management and employee compliance auditing", 8, 8, 9, 9, 9)
                    ));
        };
    }

    private void upsertDecision(DecisionRepository decisionRepository,
                                OptionRepository optionRepository,
                                List<Decision> existing,
                                String title,
                                String legacyTitle,
                                String description,
                                String createdBy,
                                String category,
                                String pollType,
                                boolean closed,
                                List<OptionData> optionDataList) {
        Decision decision = existing.stream()
                .filter(d -> title.equalsIgnoreCase(d.getTitle()) || (legacyTitle != null && legacyTitle.equalsIgnoreCase(d.getTitle())))
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
            for (int i = 0; i < optionDataList.size(); i++) {
                OptionData data = optionDataList.get(i);
                Option option = (i < currentOptions.size()) ? currentOptions.get(i) : new Option();
                applyOptionData(option, data, savedDecision);
                optionRepository.save(option);
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
