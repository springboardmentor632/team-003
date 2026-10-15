package com.decisionhub;

import com.decisionhub.dto.VoteRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.DecisionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class DecisionConcurrencyPerformanceTest {

    @Autowired private DecisionService decisionService;
    @Autowired private DecisionRepository decisions;
    @Autowired private OptionRepository options;
    @Autowired private VoteRepository votes;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;

    @Test
    @DisplayName("Performance & Concurrency: 50 concurrent voters cast votes without deadlock or lost updates")
    void testConcurrentVoting_PerformanceAndConsistency() throws InterruptedException {
        int voterCount = 50;
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(voterCount);

        // Setup Decision Board
        Decision decision = new Decision();
        decision.setTitle("High Concurrency Benchmark Board");
        decision.setCreatedBy("Admin");
        decision.setCategory("Performance");
        decision.setVisibility("PUBLIC");
        decision.setPollType("MULTIPLE_CHOICE");
        Decision savedDecision = decisions.save(decision);

        Option option = new Option();
        option.setName("Concurrent Option");
        option.setDecision(savedDecision);
        Option savedOption = options.save(option);

        // Create 50 distinct voters
        List<User> concurrentVoters = new ArrayList<>();
        for (int i = 0; i < voterCount; i++) {
            final int id = i;
            User u = users.findByEmail("perf.user" + id + "@decisionhub.test").orElseGet(() -> {
                User newUser = new User("Perf User " + id, "perf.user" + id + "@decisionhub.test", encoder.encode("pass"), "USER");
                return users.save(newUser);
            });
            concurrentVoters.add(u);
        }

        AtomicInteger successfulVotes = new AtomicInteger(0);

        for (User voter : concurrentVoters) {
            executor.submit(() -> {
                try {
                    latch.await(); // Synchronize all threads to start at the exact same instant
                    VoteRequest req = new VoteRequest();
                    req.setOptionId(savedOption.getId());
                    decisionService.castVote(savedDecision.getId(), req, voter);
                    successfulVotes.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("Concurrent vote error: " + e.getMessage());
                } finally {
                    done.countDown();
                }
            });
        }

        long startTime = System.currentTimeMillis();
        latch.countDown(); // Fire all threads
        boolean finished = done.await(30, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - startTime;

        executor.shutdown();

        // Assert all 50 concurrent votes succeeded without collision
        assertEquals(voterCount, successfulVotes.get(), "All concurrent votes must succeed");
        Decision finalDecision = decisionService.getDecisionById(savedDecision.getId());
        assertEquals(voterCount, finalDecision.getTotalVotes(), "Final vote count must equal total voters");
        System.out.println("Performance Benchmark: 50 concurrent votes processed in " + elapsed + "ms");
    }
}
