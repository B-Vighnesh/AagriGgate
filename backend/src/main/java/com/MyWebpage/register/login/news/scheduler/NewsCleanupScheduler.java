package com.MyWebpage.register.login.news.scheduler;

import com.MyWebpage.register.login.news.config.NewsApiProperties;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.service.ApiQuotaLogService;
import com.MyWebpage.register.login.news.util.NewsTime;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static net.logstash.logback.argument.StructuredArguments.keyValue;

@Component
public class NewsCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsCleanupScheduler.class);

    private final NewsApiProperties newsApiProperties;
    private final NewsRepository newsRepository;
    private final ApiQuotaLogService apiQuotaLogService;
    private final Counter archivedCounter;

    public NewsCleanupScheduler(
            NewsApiProperties newsApiProperties,
            NewsRepository newsRepository,
            ApiQuotaLogService apiQuotaLogService,
            MeterRegistry meterRegistry
    ) {
        this.newsApiProperties = newsApiProperties;
        this.newsRepository = newsRepository;
        this.apiQuotaLogService = apiQuotaLogService;
        this.archivedCounter = Counter.builder("news.cleanup.archived.total").register(meterRegistry);
    }

    @Scheduled(cron = "${news.api.cleanup-cron}")
    @Transactional
    public void cleanupOldNews() {
        if (!newsApiProperties.isSchedulerEnabled()) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now(NewsTime.IST).minusDays(newsApiProperties.getRetentionDays());
        int archived = newsRepository.archiveOldNonImportantNews(cutoff);
        if (archived > 0) {
            archivedCounter.increment(archived);
        }
        log.info(
                "news.cleanup.completed",
                keyValue("event", "news_cleanup"),
                keyValue("itemsArchived", archived),
                keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
        );
    }

    @Scheduled(cron = "${news.api.quota-reset-cron}")
    @Transactional
    public void resetQuotaAtMidnight() {
        apiQuotaLogService.resetDailyQuota("gnews");
        log.info(
                "news.quota.reset",
                keyValue("event", "news_quota_reset"),
                keyValue("apiName", "gnews"),
                keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
        );
    }
}
