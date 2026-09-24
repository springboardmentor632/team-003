package com.decisionhub.config;

import com.decisionhub.model.Comment;
import com.decisionhub.model.Community;
import com.decisionhub.model.CommunityMembership;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Notification;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.Option;
import com.decisionhub.model.Report;
import com.decisionhub.model.ReportStatus;
import com.decisionhub.model.User;
import com.decisionhub.model.Vote;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.CommunityMembershipRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/** Populates a fresh demo installation with content for every major screen. */
@Configuration
public class DemoContentConfig {
    @Bean
    @Order(3)
    CommandLineRunner seedDemoContent(UserRepository users, CommunityRepository communities,
            CommunityMembershipRepository memberships, DecisionRepository decisions,
            CommentRepository comments, VoteRepository votes, NotificationRepository notifications,
            ReportRepository reports, OptionRepository options) {
        return args -> {
            User admin = user(users, "admin@decisionhub.local");
            User maya = user(users, "maya@decisionhub.local");
            User arjun = user(users, "arjun@decisionhub.local");
            User priya = user(users, "priya@decisionhub.local");
            User rohan = user(users, "rohan@decisionhub.local");

            Community product = community(communities, "Product Builders", "A working group for roadmap, feature, and customer-experience decisions.", maya);
            Community engineering = community(communities, "Engineering Circle", "Share technical trade-offs, architecture ideas, and engineering standards.", arjun);
            Community workplace = community(communities, "Workplace & Culture", "Collaborative decisions about how the team works best together.", priya);
            Community sustainability = community(communities, "Sustainable Choices", "Practical ideas for lower-impact operations and everyday choices.", rohan);
            Community travel = community(communities, "Weekend Explorers", "Plan memorable trips, events, and local experiences together.", maya);

            join(memberships, product, maya, "OWNER"); join(memberships, product, arjun, "MODERATOR"); join(memberships, product, priya, "MEMBER");
            join(memberships, engineering, arjun, "OWNER"); join(memberships, engineering, maya, "MEMBER"); join(memberships, engineering, rohan, "MEMBER");
            join(memberships, workplace, priya, "OWNER"); join(memberships, workplace, maya, "MEMBER"); join(memberships, workplace, admin, "MEMBER");
            join(memberships, sustainability, rohan, "OWNER"); join(memberships, sustainability, priya, "MEMBER"); join(memberships, sustainability, admin, "MEMBER");
            join(memberships, travel, maya, "OWNER"); join(memberships, travel, arjun, "MEMBER"); join(memberships, travel, priya, "MEMBER");

            List<Decision> all = decisions.findAll();
            if (all.isEmpty()) return;
            Community[] groups = {product, engineering, workplace, sustainability, travel};
            for (int i = 0; i < all.size(); i++) {
                Decision decision = all.get(i);
                if (decision.getCommunity() == null) {
                    decision.setCommunity(groups[i % groups.length]);
                    decision.setCategory(new String[] {"Product", "Technology", "Culture", "Sustainability", "Travel"}[i % 5]);
                    decisions.save(decision);
                }
                seedConversation(comments, decision, maya, arjun, priya);
                seedVotes(votes, options, decision, List.of(maya, arjun, priya, rohan));
            }

            notifyIfMissing(notifications, maya, NotificationType.GENERAL, "Welcome to DecisionHub. Your Product Builders community is ready for discussion.", all.get(0));
            notifyIfMissing(notifications, arjun, NotificationType.COMMENT, "Priya added a useful perspective to a decision you are following.", all.get(Math.min(1, all.size() - 1)));
            notifyIfMissing(notifications, priya, NotificationType.VOTE, "A community decision has new votes. Review the latest result when you have a moment.", all.get(Math.min(2, all.size() - 1)));
            if (reports.count() == 0) {
                Report report = new Report(admin, all.get(0), "Demo moderation item: review the wording before publishing widely.");
                report.setStatus(ReportStatus.PENDING);
                reports.save(report);
            }
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
    private void seedConversation(CommentRepository repo, Decision decision, User maya, User arjun, User priya) {
        if (!repo.findByDecisionIdOrderByCreatedAtAsc(decision.getId()).isEmpty()) return;
        Comment first = repo.save(new Comment("I support comparing the long-term impact alongside the immediate cost.", decision, maya));
        first.setReactionCount(4); repo.save(first);
        Comment reply = new Comment("Agreed — the implementation effort should be explicit in the final comparison.", decision, arjun);
        reply.setParentComment(first); reply.setReactionCount(2); repo.save(reply);
        repo.save(new Comment("The trade-offs are clear. I would be comfortable moving forward after one more round of feedback.", decision, priya));
    }
    private void seedVotes(VoteRepository repo, OptionRepository optionRepository, Decision decision, List<User> voters) {
        List<Option> options = optionRepository.findByDecisionId(decision.getId());
        if (options.isEmpty()) return;
        for (int i = 0; i < voters.size(); i++) {
            User voter = voters.get(i);
            if (repo.existsByDecisionIdAndVoterId(decision.getId(), voter.getId())) continue;
            Vote vote = new Vote(decision, options.get(i % options.size()), voter);
            vote.setRating(3 + (i % 3));
            repo.save(vote);
        }
    }
    private void notifyIfMissing(NotificationRepository repo, User recipient, NotificationType type, String message, Decision decision) {
        if (repo.findByRecipientIdOrderByCreatedAtDesc(recipient.getId()).stream().anyMatch(n -> n.getMessage().equals(message))) return;
        Notification notification = new Notification(recipient, type, message);
        notification.setDecision(decision);
        repo.save(notification);
    }
}
