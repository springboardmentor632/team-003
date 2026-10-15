package com.decisionhub.service;

import com.decisionhub.model.Decision;
import com.decisionhub.model.NotificationType;
import com.decisionhub.model.User;
import com.decisionhub.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

class NotificationServiceTest {
    @Test void avoidsDuplicateDailyVotingReminders() {
        NotificationRepository repository = mock(NotificationRepository.class);
        NotificationService service = new NotificationService(repository);
        User user = new User(); user.setId(1L); Decision decision = new Decision(); decision.setId(2L);
        when(repository.existsByRecipientIdAndTypeAndDecisionIdAndCreatedAtAfter(eq(1L), eq(NotificationType.VOTING_REMINDER), eq(2L), any())).thenReturn(true);
        service.notifyOncePerDay(user, NotificationType.VOTING_REMINDER, "Reminder", decision);
        verify(repository, never()).save(any());
    }
    @Test void savesSystemNotifications() {
        NotificationRepository repository = mock(NotificationRepository.class);
        NotificationService service = new NotificationService(repository);
        User user = new User(); user.setId(1L);
        service.system(user, "Maintenance notice");
        verify(repository).save(any());
    }
}
