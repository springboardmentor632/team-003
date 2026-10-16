package com.decisionhub.config;

import com.decisionhub.model.Comment;
import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityInvitation;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Discussion;
import com.decisionhub.model.DiscussionComment;
import com.decisionhub.model.Feedback;
import com.decisionhub.model.Notification;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.Option;
import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import com.decisionhub.model.Suggestion;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.CommunityInvitationRepository;
import com.decisionhub.repository.CommunityMembershipRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.DiscussionCommentRepository;
import com.decisionhub.repository.DiscussionRepository;
import com.decisionhub.repository.FeedbackRepository;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.SuggestionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/** Populates a fresh or existing demo installation with role-specific content across every screen. */
@Configuration
public class DemoContentConfig {
    @Bean
    @Order(3)
    CommandLineRunner seedDemoContent(UserRepository users, CommunityRepository communities,
            CommunityMembershipRepository memberships, CommunityInvitationRepository invitations,
            DecisionRepository decisions, CommentRepository comments, SuggestionRepository suggestions,
            FeedbackRepository feedback, VoteRepository votes, NotificationRepository notifications,
            ReportRepository reports, OptionRepository options, DiscussionRepository discussions,
            DiscussionCommentRepository discussionComments) {
        return args -> {
            User admin = user(users, "admin@decisionhub.local");
            User harish = user(users, "harish@decisionhub.local");
            User maya = user(users, "maya@decisionhub.local");
            User arjun = user(users, "arjun@decisionhub.local");
            User priya = user(users, "priya@decisionhub.local");
            User rohan = user(users, "rohan@decisionhub.local");

            // Distinct Communities per Role
            Community governance = community(communities, "Platform Governance & Security",
                    "Organization-wide security standards, cloud governance, and vendor compliance.", admin);
            Community product = community(communities, "Product Builders",
                    "A working group for roadmap, feature, and customer-experience decisions.", maya);
            Community engineering = community(communities, "Engineering Circle",
                    "Share technical trade-offs, architecture ideas, and engineering standards.", arjun);
            Community aiGuild = community(communities, "AI & Architecture Guild",
                    "Evaluate LLM tooling, inference costs, and distributed service architecture.", arjun);
            Community workplace = community(communities, "Workplace & Culture",
                    "Collaborative decisions about how the team works best together.", priya);
            Community sustainability = community(communities, "Sustainable Choices",
                    "Practical ideas for lower-impact operations and everyday choices.", rohan);
            Community travel = community(communities, "Weekend Explorers",
                    "Plan memorable trips, events, and local experiences together.", maya);

            // Role-differentiated Community Memberships:
            // - Admin (ADMIN): Owner of Platform Governance, Member of Workplace & Sustainability
            join(memberships, governance, admin, "OWNER");
            join(memberships, governance, arjun, "MODERATOR");
            join(memberships, governance, maya, "MEMBER");

            // - Maya (Community Owner): Owner of Product Builders & Weekend Explorers
            join(memberships, product, maya, "OWNER");
            join(memberships, product, arjun, "MODERATOR");
            join(memberships, product, priya, "MEMBER");

            // - Arjun (Community Moderator & Tech Owner): Owner of Engineering Circle & AI Guild, Moderator of Product Builders & Governance
            join(memberships, engineering, arjun, "OWNER");
            join(memberships, engineering, maya, "MEMBER");
            join(memberships, engineering, rohan, "MEMBER");

            join(memberships, aiGuild, arjun, "OWNER");
            join(memberships, aiGuild, priya, "MODERATOR");
            join(memberships, aiGuild, admin, "MEMBER");

            // - Priya (Culture Owner): Owner of Workplace & Culture
            join(memberships, workplace, priya, "OWNER");
            join(memberships, workplace, maya, "MEMBER");
            join(memberships, workplace, admin, "MEMBER");
            join(memberships, workplace, harish, "MEMBER");

            // - Rohan (Sustainability Owner): Owner of Sustainable Choices
            join(memberships, sustainability, rohan, "OWNER");
            join(memberships, sustainability, priya, "MEMBER");
            join(memberships, sustainability, admin, "MEMBER");

            // - Harish (Regular Member USER): Member of Weekend Explorers & Workplace & Culture (no moderator/owner power)
            join(memberships, travel, maya, "OWNER");
            join(memberships, travel, arjun, "MEMBER");
            join(memberships, travel, priya, "MEMBER");
            join(memberships, travel, harish, "MEMBER");

            // Pending Community Invitations per Role
            inviteIfMissing(invitations, engineering, harish, arjun);
            inviteIfMissing(invitations, aiGuild, maya, arjun);
            inviteIfMissing(invitations, sustainability, arjun, rohan);

            List<Decision> all = decisions.findAll();
            if (all.isEmpty()) return;

            for (Decision decision : all) {
                String title = decision.getTitle() == null ? "" : decision.getTitle();
                if (title.contains("Cloud") || title.contains("Identity") || title.contains("Sovereign") || title.contains("Admin:")) {
                    decision.setCommunity(governance);
                } else if (title.contains("Incident") || title.contains("On-Call") || title.contains("On-call")) {
                    decision.setCommunity(aiGuild);
                } else if (title.contains("Ingress") || title.contains("Inference") || title.contains("Gateway") || title.contains("Arjun:")) {
                    decision.setCommunity(engineering);
                } else if (title.contains("Retreat") || title.contains("Workcation") || title.contains("Travel") || title.contains("Weekend")) {
                    decision.setCommunity(travel);
                } else if (title.contains("Product Strategy") || title.contains("SaaS Pricing") || title.contains("Roadmap") || title.contains("Maya:")) {
                    decision.setCommunity(product);
                } else if (title.contains("Career") || title.contains("Hybrid") || title.contains("Onboarding") || title.contains("Harish: Career")) {
                    decision.setCommunity(workplace);
                } else if (title.contains("Sustainability") || title.contains("Solar") || title.contains("Green") || title.contains("Rohan:")) {
                    decision.setCommunity(sustainability);
                }
                decisions.save(decision);

                seedConversation(comments, decision, maya, arjun, priya, harish);
                seedSuggestions(suggestions, decision, maya, arjun, rohan);
                seedVotes(votes, options, decision, List.of(maya, arjun, priya, rohan, harish));
            }

            // Role-specific Notifications
            notifyIfMissing(notifications, admin, NotificationType.SYSTEM,
                    "Governance alert: 2 community moderation reports are awaiting review.", all.get(0));
            notifyIfMissing(notifications, admin, NotificationType.VOTE,
                    "Arjun Mehta and Maya Patel voted on Enterprise Cloud Hosting & Multi-Region Resiliency.", all.get(0));

            notifyIfMissing(notifications, arjun, NotificationType.COMMENT,
                    "Maya commented on your Microservices Ingress Gateway & Service Mesh Architecture board.",
                    findByKeyword(all, "Ingress", all.get(0)));
            notifyIfMissing(notifications, arjun, NotificationType.COMMUNITY_INVITATION,
                    "Rohan Shah invited you to join Sustainable Choices.",
                    findByKeyword(all, "Solar", all.get(0)));

            notifyIfMissing(notifications, maya, NotificationType.GENERAL,
                    "Welcome to DecisionHub. Your Product Builders community has 3 active discussions.",
                    findByKeyword(all, "Product Strategy", all.get(0)));
            notifyIfMissing(notifications, maya, NotificationType.VOTE,
                    "New votes were cast on Q4 Product Strategy: Real-Time Deliberation vs Native Chat Bots.",
                    findByKeyword(all, "Product Strategy", all.get(0)));

            notifyIfMissing(notifications, harish, NotificationType.COMMENT,
                    "Priya Nair shared career transition advice on Career Trajectory: Staff Technical Lead vs Engineering Management.",
                    findByKeyword(all, "Career", all.get(0)));
            notifyIfMissing(notifications, harish, NotificationType.COMMUNITY_INVITATION,
                    "Arjun Mehta invited you to collaborate in Engineering Circle.",
                    findByKeyword(all, "Ingress", all.get(0)));

            notifyIfMissing(notifications, priya, NotificationType.VOTE,
                    "A community decision has new votes. Review the latest result when you have a moment.",
                    findByKeyword(all, "Hybrid", all.get(0)));

            // Role-specific Feedback Entries
            seedFeedbackIfMissing(feedback, harish,
                    "Love how the criteria dots make comparing career trajectory options visual and objective!",
                    findByKeyword(all, "Career", all.get(0)), "OPEN");
            seedFeedbackIfMissing(feedback, maya,
                    "Can we export Product Builders poll results directly to our quarterly roadmap deck?",
                    findByKeyword(all, "Product Strategy", all.get(0)), "REVIEWED");
            seedFeedbackIfMissing(feedback, arjun,
                    "Community-scoped moderation queue works great for Engineering Circle.",
                    findByKeyword(all, "Ingress", all.get(0)), "RESOLVED");

            // Role-specific Moderation Reports (so Admin, Arjun, and Maya each see relevant moderation items)
            Decision productBoard = findByKeyword(all, "Product Strategy", all.get(0));
            Decision engBoard = findByKeyword(all, "Ingress", all.get(0));
            seedReportIfMissing(reports, priya, productBoard,
                    "Please verify Q4 customer survey sample size before closing this roadmap poll.");
            seedReportIfMissing(reports, rohan, engBoard,
                    "Benchmark numbers in the comment thread need updated latency figures.");

            // Seed Authentic Collaborative Deliberation Discussions & Comments
            seedDiscussions(discussions, discussionComments, admin, harish, maya, arjun, priya, rohan);
        };
    }

    private void seedDiscussions(DiscussionRepository discussionsRepo, DiscussionCommentRepository commentsRepo,
            User admin, User harish, User maya, User arjun, User priya, User rohan) {
        if (!discussionsRepo.findAll().isEmpty()) {
            return;
        }

        // Thread 1: Architecture RFC by Arjun Mehta
        Discussion d1 = discussionsRepo.save(new Discussion(
                "RFC: Apache Kafka vs AWS SQS/SNS for Event-Driven Microservices",
                "Evaluating our event streaming backbone for DecisionHub's async deliberation notifications, live vote tallies, and audit logs.\n\n"
                + "• Option A: Apache Kafka (Managed Strimzi / Confluent Cloud)\n"
                + "  - Strictly ordered partitioned event streams per decision board\n"
                + "  - Guaranteed message replay capability for disaster recovery and compliance audit trails\n"
                + "  - High write throughput (up to 150k events/sec) with sub-15ms latency\n\n"
                + "• Option B: AWS SQS FIFO + SNS Fanout\n"
                + "  - Zero operational overhead, serverless auto-scaling\n"
                + "  - Native integration with AWS Lambda and CloudWatch\n"
                + "  - Higher cost at continuous burst scale; partition throughput capped at 3,000 msg/sec with batching\n\n"
                + "Please share your operational feedback before we create a formal decision board next Monday.",
                arjun
        ));

        DiscussionComment c1 = commentsRepo.save(new DiscussionComment(
                "From a client-side perspective, Kafka's partitioned changelogs make syncing WebSocket updates much simpler because we can key by boardId.",
                d1, maya, null
        ));
        commentsRepo.save(new DiscussionComment(
                "@Maya Exactly, and it eliminates race conditions on concurrent ballot casting across multi-region edge nodes.",
                d1, arjun, c1
        ));
        commentsRepo.save(new DiscussionComment(
                "What is the on-call burden for our SRE rotation if a Kafka broker drops out during a weekend deliberation spike?",
                d1, priya, null
        ));
        commentsRepo.save(new DiscussionComment(
                "With Strimzi on EKS and automated rebalancing, broker recovery is hands-off. In our stress tests, recovery completed in under 45 seconds.",
                d1, admin, null
        ));

        // Thread 2: Product Strategy by Maya Patel
        Discussion d2 = discussionsRepo.save(new Discussion(
                "Q4 Product Strategy: In-App Collaborative Canvas vs Native Chat Deliberation",
                "As we plan our Q4 roadmap for scaling DecisionHub across enterprise teams, we have two primary product directions to drive user engagement:\n\n"
                + "1. Live Collaborative Deliberation Canvas: Real-time visual mapping of trade-off matrices, drag-and-drop pros/cons, and live radar chart animations.\n"
                + "2. Native Slack & Microsoft Teams Apps: Bring instant single-click polling, thread deliberation summaries, and vote receipts directly into existing enterprise daily chat channels.\n\n"
                + "Which of these workflows would accelerate your team's decision speed more effectively?",
                maya
        ));

        DiscussionComment c2_1 = commentsRepo.save(new DiscussionComment(
                "The Slack app integration would solve our biggest adoption hurdle — team members don't need to open a new tab just to cast their ballot on time.",
                d2, harish, null
        ));
        commentsRepo.save(new DiscussionComment(
                "@Harish Agreed. We can always build the real-time canvas on web as phase 2 once daily deliberation habits are established in Slack.",
                d2, arjun, c2_1
        ));
        commentsRepo.save(new DiscussionComment(
                "Enterprise clients consistently request Teams approval workflows in their security reviews. That should give Slack/Teams high priority.",
                d2, admin, null
        ));

        // Thread 3: Culture & Workplace by Priya Sharma
        Discussion d3 = discussionsRepo.save(new Discussion(
                "Remote-First Work Policy & Asynchronous Deliberation Guidelines",
                "We are reviewing our hybrid/remote team collaboration norms for the upcoming fiscal year. Our proposed guidelines:\n\n"
                + "• Core async collaboration window: 10:00 AM – 2:00 PM UTC for team syncs\n"
                + "• All architectural RFCs and strategic roadmap decisions must have a mandatory 72-hour async deliberation period before voting closes\n"
                + "• Focus Wednesdays: Meeting-free days across all engineering and design circles\n\n"
                + "Looking for thoughts on whether 72 hours provides adequate deliberation time across multiple time zones.",
                priya
        ));

        DiscussionComment c3_1 = commentsRepo.save(new DiscussionComment(
                "72 hours is ideal. It allows team members in APAC and EMEA to review proposals during their normal working hours without feeling pressured.",
                d3, rohan, null
        ));
        commentsRepo.save(new DiscussionComment(
                "Meeting-free Wednesdays have been great for deep focus work. Full support for making this an official company-wide standard.",
                d3, harish, c3_1
        ));
        commentsRepo.save(new DiscussionComment(
                "Should we also add an exception rule for emergency P0 hotfixes to bypass the 72h window?",
                d3, arjun, null
        ));

        // Thread 4: Growth Stipend by Harish
        Discussion d4 = discussionsRepo.save(new Discussion(
                "Annual Professional Growth & Home Lab Stipend Allocation Model",
                "Reviewing how we can best utilize the $2,500 annual professional development stipend:\n\n"
                + "• Cloud certifications (AWS Solutions Architect, CKA, Terraform) + sandbox accounts\n"
                + "• Physical workstation ergonomics (standing desk converters, Herman Miller chairs)\n"
                + "• Executive technical communication and leadership workshops\n\n"
                + "What has delivered the highest career dividend for folks here?",
                harish
        ));

        commentsRepo.save(new DiscussionComment(
                "The CKA and AWS certifications were instrumental for our infrastructure modernization. Hands-on sandbox vouchers are well worth it.",
                d4, arjun, null
        ));
        commentsRepo.save(new DiscussionComment(
                "You can also combine educational courses with physical books under our existing learning policy reimbursement.",
                d4, priya, null
        ));

        // Thread 5: AI & Security by System Admin
        Discussion d5 = discussionsRepo.save(new Discussion(
                "Zero Data Retention (ZDR) Guarantees for AI Deliberation Synthesizer",
                "Before deploying our AI consensus summarizer and deliberation copilot to production boards, we must mandate strict corporate data security controls:\n\n"
                + "• Enforcing Enterprise ZDR agreements with API providers so customer votes are never retained or trained on\n"
                + "• Exploring self-hosted quantized Llama 3 models in our private AWS VPC for sensitive financial boards\n\n"
                + "Please review the security and latency trade-offs.",
                admin
        ));

        commentsRepo.save(new DiscussionComment(
                "Self-hosting Llama 3 on g5.2xlarge instances gives us complete perimeter containment with under 200ms TTFT.",
                d5, arjun, null
        ));
        commentsRepo.save(new DiscussionComment(
                "Enterprise customers in healthcare and fintech will require signed ZDR terms before adopting. Let's make this our default tier policy.",
                d5, maya, null
        ));
    }

    private User user(UserRepository users, String email) { return users.findByEmail(email).orElseThrow(); }
    private Community community(CommunityRepository repo, String name, String description, User owner) {
        return repo.findByName(name).orElseGet(() -> repo.save(new Community(name, description, owner)));
    }
    private void join(CommunityMembershipRepository repo, Community community, User user, String role) {
        if (repo.existsByCommunityIdAndUserId(community.getId(), user.getId())) return;
        CommunityMembership membership = new CommunityMembership(community, user);
        membership.setRole(role);
        repo.save(membership);
    }
    private void inviteIfMissing(CommunityInvitationRepository repo, Community community, User invitee, User inviter) {
        boolean alreadyPending = repo.findByInviteeIdAndStatus(invitee.getId(), "PENDING").stream()
                .anyMatch(inv -> inv.getCommunity().getId().equals(community.getId()));
        if (!alreadyPending) {
            repo.save(new CommunityInvitation(community, invitee, inviter));
        }
    }
    private Decision findByKeyword(List<Decision> decisions, String keyword, Decision fallback) {
        return decisions.stream()
                .filter(d -> d.getTitle() != null && d.getTitle().toLowerCase().contains(keyword.toLowerCase()))
                .findFirst()
                .orElse(fallback);
    }
    private Decision findByPrefix(List<Decision> decisions, String prefix, Decision fallback) {
        return decisions.stream()
                .filter(d -> d.getTitle() != null && d.getTitle().startsWith(prefix))
                .findFirst()
                .orElse(fallback);
    }
    private void seedConversation(CommentRepository repo, Decision decision, User maya, User arjun, User priya, User harish) {
        if (!repo.findByDecisionIdOrderByCreatedAtAsc(decision.getId()).isEmpty()) return;
        Comment first = new Comment("I support comparing the long-term impact alongside the immediate implementation cost.", decision, maya);
        first.setCommunity(decision.getCommunity());
        first.setReactionCount(4);
        first = repo.save(first);

        Comment reply = new Comment("Agreed — the operational effort and risk score make the trade-offs much clearer.", decision, arjun);
        reply.setCommunity(decision.getCommunity());
        reply.setParentComment(first);
        reply.setReactionCount(2);
        repo.save(reply);

        Comment third = new Comment("The criteria breakdown looks solid. I cast my vote after reviewing the pros and cons.", decision,
                "Harish".equals(decision.getCreatedBy()) ? priya : harish);
        third.setCommunity(decision.getCommunity());
        third.setReactionCount(1);
        repo.save(third);
    }
    private void seedSuggestions(SuggestionRepository repo, Decision decision, User maya, User arjun, User rohan) {
        if (!repo.findByDecisionIdOrderByCreatedAtDesc(decision.getId()).isEmpty()) return;
        repo.save(new Suggestion("Run a 2-week pilot on the leading option before committing the full quarterly budget.", decision, arjun));
        repo.save(new Suggestion("Document the reversibility plan in case key assumptions change next month.", decision, maya));
        repo.save(new Suggestion("Include sustainability and long-term maintenance overhead in the final review.", decision, rohan));
    }
    private void seedVotes(VoteRepository repo, OptionRepository optionRepository, Decision decision, List<User> voters) {
        List<Option> options = optionRepository.findByDecisionId(decision.getId());
        if (options.isEmpty()) return;
        for (int i = 0; i < voters.size(); i++) {
            User voter = voters.get(i);
            if (repo.existsByDecisionIdAndVoterId(decision.getId(), voter.getId())) continue;
            int optionIdx = (int) ((decision.getId() + i) % options.size());
            Vote vote = new Vote(decision, options.get(optionIdx), voter);
            vote.setRating(3 + ((i + (int) (long) decision.getId()) % 3));
            repo.save(vote);
        }
    }
    private void notifyIfMissing(NotificationRepository repo, User recipient, NotificationType type, String message, Decision decision) {
        if (repo.findByRecipientIdOrderByCreatedAtDesc(recipient.getId()).stream().anyMatch(n -> n.getMessage().equals(message))) return;
        Notification notification = new Notification(recipient, type, message);
        notification.setDecision(decision);
        repo.save(notification);
    }
    private void seedFeedbackIfMissing(FeedbackRepository repo, User author, String message, Decision decision, String status) {
        if (repo.findByAuthorIdOrderByCreatedAtDesc(author.getId()).stream().anyMatch(f -> f.getMessage().equals(message))) return;
        Feedback entry = new Feedback(message, author);
        entry.setDecision(decision);
        entry.setStatus(status);
        repo.save(entry);
    }
    private void seedReportIfMissing(ReportRepository repo, User reporter, Decision decision, String reason) {
        boolean exists = repo.findAll().stream()
                .anyMatch(r -> r.getReporter().getId().equals(reporter.getId()) && r.getDecision().getId().equals(decision.getId()));
        if (!exists) {
            Report report = new Report(reporter, decision, reason);
            report.setStatus(ReportStatus.PENDING);
            repo.save(report);
        }
    }
}
