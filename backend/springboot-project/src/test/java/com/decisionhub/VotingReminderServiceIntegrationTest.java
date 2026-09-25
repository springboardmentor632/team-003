package com.decisionhub;

import com.decisionhub.model.Decision;
import com.decisionhub.model.Notification;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.VotingReminderService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class VotingReminderServiceIntegrationTest {
    @Autowired private VotingReminderService reminders;
    @Autowired private UserRepository users;
    @Autowired private DecisionRepository decisions;
    @Autowired private NotificationRepository notifications;

    @Test
    void scheduledJobRemindsEligibleUsersAndDoesNotDuplicateReminders() {
        String suffix = UUID.randomUUID().toString();
        User owner = users.save(new User("Reminder Owner " + suffix, suffix + ".owner@example.com", "password123", "USER"));
        User voter = users.save(new User("Reminder Voter " + suffix, suffix + ".voter@example.com", "password123", "USER"));
        Decision openBoard = board("Open roadmap " + suffix, owner.getName(), "PUBLIC", false);
        Decision privateBoard = board("Private roadmap " + suffix, owner.getName(), "PRIVATE", false);
        Decision closedBoard = board("Closed roadmap " + suffix, owner.getName(), "PUBLIC", true);
        decisions.saveAll(List.of(openBoard, privateBoard, closedBoard));

        reminders.sendOpenBoardReminders();
        reminders.sendOpenBoardReminders();

        List<Notification> voterReminders = notifications.findByRecipientIdOrderByCreatedAtDesc(voter.getId()).stream()
                .filter(notification -> notification.getType() == NotificationType.VOTING_REMINDER)
                .toList();
        List<Notification> ownerReminders = notifications.findByRecipientIdOrderByCreatedAtDesc(owner.getId()).stream()
                .filter(notification -> notification.getType() == NotificationType.VOTING_REMINDER)
                .toList();

        assertEquals(1, voterReminders.stream().filter(notification -> notification.getDecisionId().equals(openBoard.getId())).count());
        assertTrue(voterReminders.stream().noneMatch(notification -> notification.getDecisionId().equals(privateBoard.getId())));
        assertTrue(voterReminders.stream().noneMatch(notification -> notification.getDecisionId().equals(closedBoard.getId())));
        assertTrue(ownerReminders.stream().noneMatch(notification -> notification.getDecisionId().equals(openBoard.getId())));
    }

    private Decision board(String title, String creator, String visibility, boolean closed) {
        Decision decision = new Decision();
        decision.setTitle(title);
        decision.setCreatedBy(creator);
        decision.setVisibility(visibility);
        decision.setClosed(closed);
        return decision;
    }
}
