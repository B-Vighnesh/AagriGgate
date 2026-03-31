package com.MyWebpage.register.login.news.scheduler;

import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class NewsSchedulerState {

    private volatile Instant lastCycleStartedAt;
    private volatile Instant lastCycleCompletedAt;
    private volatile boolean allSourcesFailedLastCycle;
    private volatile int lastCycleSuccessCount;
    private volatile int lastCycleFailureCount;

    public void markCycleStarted() {
        lastCycleStartedAt = Instant.now();
    }

    public void markCycleCompleted(int successCount, int failureCount) {
        lastCycleCompletedAt = Instant.now();
        lastCycleSuccessCount = successCount;
        lastCycleFailureCount = failureCount;
        allSourcesFailedLastCycle = successCount == 0 && failureCount > 0;
    }

    public Instant getLastCycleStartedAt() {
        return lastCycleStartedAt;
    }

    public Instant getLastCycleCompletedAt() {
        return lastCycleCompletedAt;
    }

    public boolean isAllSourcesFailedLastCycle() {
        return allSourcesFailedLastCycle;
    }

    public int getLastCycleSuccessCount() {
        return lastCycleSuccessCount;
    }

    public int getLastCycleFailureCount() {
        return lastCycleFailureCount;
    }
}
