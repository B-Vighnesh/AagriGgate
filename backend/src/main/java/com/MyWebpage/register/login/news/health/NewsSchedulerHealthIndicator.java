package com.MyWebpage.register.login.news.health;

import com.MyWebpage.register.login.news.config.NewsApiProperties;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import com.MyWebpage.register.login.news.scheduler.NewsSchedulerState;
import com.MyWebpage.register.login.news.util.NewsTime;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Component
public class NewsSchedulerHealthIndicator implements HealthIndicator {

    private final TrustedSourceRepository trustedSourceRepository;
    private final NewsSchedulerState newsSchedulerState;
    private final NewsApiProperties newsApiProperties;

    public NewsSchedulerHealthIndicator(
            TrustedSourceRepository trustedSourceRepository,
            NewsSchedulerState newsSchedulerState,
            NewsApiProperties newsApiProperties
    ) {
        this.trustedSourceRepository = trustedSourceRepository;
        this.newsSchedulerState = newsSchedulerState;
        this.newsApiProperties = newsApiProperties;
    }

    @Override
    public Health health() {
        List<TrustedSource> activeSources = trustedSourceRepository.findByIsActiveTrue();
        LocalDateTime latestFetch = activeSources.stream()
                .map(TrustedSource::getLastFetchedAt)
                .filter(value -> value != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        Instant lastCompletedAt = newsSchedulerState.getLastCycleCompletedAt();
        if (latestFetch == null || lastCompletedAt == null) {
            return Health.down()
                    .withDetail("reason", "News scheduler has not completed a cycle yet")
                    .build();
        }

        Duration sinceLatestFetch = Duration.between(latestFetch.atZone(NewsTime.IST).toInstant(), Instant.now());
        if (sinceLatestFetch.toHours() >= newsApiProperties.getStaleWithinHours()) {
            return Health.down()
                    .withDetail("reason", "Scheduler thread dead or stale")
                    .withDetail("hoursSinceLastFetch", sinceLatestFetch.toHours())
                    .build();
        }

        if (newsSchedulerState.isAllSourcesFailedLastCycle()) {
            return Health.outOfService()
                    .withDetail("reason", "All sources failed in the last cycle")
                    .withDetail("lastCycleFailures", newsSchedulerState.getLastCycleFailureCount())
                    .build();
        }

        if (sinceLatestFetch.toHours() <= newsApiProperties.getHealthyWithinHours()) {
            return Health.up()
                    .withDetail("hoursSinceLastFetch", sinceLatestFetch.toHours())
                    .withDetail("lastCycleSuccesses", newsSchedulerState.getLastCycleSuccessCount())
                    .build();
        }

        return Health.outOfService()
                .withDetail("reason", "No recent fetch within healthy window")
                .withDetail("hoursSinceLastFetch", sinceLatestFetch.toHours())
                .build();
    }
}
