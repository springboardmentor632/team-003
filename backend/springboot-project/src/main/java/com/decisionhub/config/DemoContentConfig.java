package com.decisionhub.config;

import com.decisionhub.model.Comment;
import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityInvitation;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.Decision;
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
            ReportRepository reports, OptionRepository options) {
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
                if (title.startsWith("Admin: Team onboarding")) {
                    decision.setCommunity(workplace);
                } else if (title.startsWith("Admin:")) {
                    decision.setCommunity(governance);
                } else if (title.startsWith("Arjun: On-call")) {
                    decision.setCommunity(aiGuild);
                } else if (title.startsWith("Arjun:")) {
                    decision.setCommunity(engineering);
                } else if (title.startsWith("Maya: Annual team retreat")) {
                    decision.setCommunity(travel);
                } else if (title.startsWith("Maya:")) {
                    decision.setCommunity(product);
                } else if (title.startsWith("Harish: Career switch")) {
                    decision.setCommunity(workplace);
                } else if (title.startsWith("Harish: Travel plan")) {
                    decision.setCommunity(travel);
                } else if (title.startsWith("Priya:")) {
                    decision.setCommunity(workplace);
                } else if (title.startsWith("Rohan:")) {
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
                    "Arjun Mehta and Maya Patel voted on Admin: Cloud migration.", all.get(0));

            notifyIfMissing(notifications, arjun, NotificationType.COMMENT,
                    "Maya commented on your API gateway & service mesh architecture board.",
                    findByPrefix(all, "Arjun: API gateway", all.get(0)));
            notifyIfMissing(notifications, arjun, NotificationType.COMMUNITY_INVITATION,
                    "Rohan Shah invited you to join Sustainable Choices.",
                    findByPrefix(all, "Rohan:", all.get(0)));

            notifyIfMissing(notifications, maya, NotificationType.GENERAL,
                    "Welcome to DecisionHub. Your Product Builders community has 3 active discussions.",
                    findByPrefix(all, "Maya: Q4", all.get(0)));
            notifyIfMissing(notifications, maya, NotificationType.VOTE,
                    "New votes were cast on Q4 product roadmap focus.",
                    findByPrefix(all, "Maya: Q4", all.get(0)));

            notifyIfMissing(notifications, harish, NotificationType.COMMENT,
                    "Priya Nair shared career transition advice on Harish: Career switch.",
                    findByPrefix(all, "Harish: Career", all.get(0)));
            notifyIfMissing(notifications, harish, NotificationType.COMMUNITY_INVITATION,
                    "Arjun Mehta invited you to collaborate in Engineering Circle.",
                    findByPrefix(all, "Arjun: API gateway", all.get(0)));

            notifyIfMissing(notifications, priya, NotificationType.VOTE,
                    "A community decision has new votes. Review the latest result when you have a moment.",
                    findByPrefix(all, "Priya:", all.get(0)));

            // Role-specific Feedback Entries
            seedFeedbackIfMissing(feedback, harish,
                    "Love how the criteria dots make comparing Career Switch options visual and objective!",
                    findByPrefix(all, "Harish: Career", all.get(0)), "OPEN");
            seedFeedbackIfMissing(feedback, maya,
                    "Can we export Product Builders poll results directly to our quarterly roadmap deck?",
                    findByPrefix(all, "Maya: Q4", all.get(0)), "REVIEWED");
            seedFeedbackIfMissing(feedback, arjun,
                    "Community-scoped moderation queue works great for Engineering Circle.",
                    findByPrefix(all, "Arjun: API gateway", all.get(0)), "RESOLVED");

            // Role-specific Moderation Reports (so Admin, Arjun, and Maya each see relevant moderation items)
            Decision productBoard = findByPrefix(all, "Maya: Q4", all.get(0));
            Decision engBoard = findByPrefix(all, "Arjun: API gateway", all.get(0));
            seedReportIfMissing(reports, priya, productBoard,
                    "Please verify Q4 customer survey sample size before closing this roadmap poll.");
            seedReportIfMissing(reports, rohan, engBoard,
                    "Benchmark numbers in the comment thread need updated latency figures.");
        };
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
