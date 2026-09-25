package com.decisionhub.service;

import com.decisionhub.model.Decision;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class VotingReminderService {
    private final DecisionRepository decisions; private final UserRepository users; private final NotificationService notifications;
    public VotingReminderService(DecisionRepository decisions, UserRepository users, NotificationService notifications) { this.decisions = decisions; this.users = users; this.notifications = notifications; }
    @Scheduled(cron = "${app.notifications.voting-reminder-cron:0 0 9 * * *}")
    public void sendOpenBoardReminders() {
        for (Decision board : decisions.findAll()) if (!board.isClosed() && "PUBLIC".equals(board.getVisibility())) {
            for (User user : users.findAll()) if (!user.getName().equals(board.getCreatedBy()))
                notifications.notifyOncePerDay(user, NotificationType.VOTING_REMINDER, "Reminder: vote on " + board.getTitle(), board);
        }
    }
}
