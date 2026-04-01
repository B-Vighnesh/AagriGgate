package com.MyWebpage.register.login.news.config;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "news.api")
public class NewsApiProperties {

    @NotBlank
    private String key;

    @NotBlank
    private String gnewsUrl;

    @Min(1)
    @Max(60)
    private int rssTimeoutSeconds = 15;

    @Min(1)
    @Max(30)
    private int gnewsTimeoutSeconds = 5;

    @Min(1)
    @Max(200)
    private int maxItemsPerSource = 100;

    @NotBlank
    private String schedulerCron;

    @NotBlank
    private String cleanupCron;

    @NotBlank
    private String quotaResetCron;

    @Min(1)
    @Max(365)
    private int retentionDays = 90;

    private boolean schedulerEnabled = true;

    private boolean gnewsEnabled = true;

    @Min(1)
    @Max(50)
    private int executorPoolSize = 5;

    @Min(1)
    @Max(500)
    private int gnewsDailyLimit = 90;

    @Min(1)
    @Max(240)
    private int cacheTtlSeconds = 120;

    @Min(1)
    @Max(24)
    private int healthyWithinHours = 7;

    @Min(1)
    @Max(48)
    private int staleWithinHours = 13;

    @PostConstruct
    void validateCronExpressions() {
        CronExpression.parse(schedulerCron);
        CronExpression.parse(cleanupCron);
        CronExpression.parse(quotaResetCron);
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getGnewsUrl() {
        return gnewsUrl;
    }

    public void setGnewsUrl(String gnewsUrl) {
        this.gnewsUrl = gnewsUrl;
    }

    public int getRssTimeoutSeconds() {
        return rssTimeoutSeconds;
    }

    public void setRssTimeoutSeconds(int rssTimeoutSeconds) {
        this.rssTimeoutSeconds = rssTimeoutSeconds;
    }

    public int getGnewsTimeoutSeconds() {
        return gnewsTimeoutSeconds;
    }

    public void setGnewsTimeoutSeconds(int gnewsTimeoutSeconds) {
        this.gnewsTimeoutSeconds = gnewsTimeoutSeconds;
    }

    public int getMaxItemsPerSource() {
        return maxItemsPerSource;
    }

    public void setMaxItemsPerSource(int maxItemsPerSource) {
        this.maxItemsPerSource = maxItemsPerSource;
    }

    public String getSchedulerCron() {
        return schedulerCron;
    }

    public void setSchedulerCron(String schedulerCron) {
        this.schedulerCron = schedulerCron;
    }

    public String getCleanupCron() {
        return cleanupCron;
    }

    public void setCleanupCron(String cleanupCron) {
        this.cleanupCron = cleanupCron;
    }

    public String getQuotaResetCron() {
        return quotaResetCron;
    }

    public void setQuotaResetCron(String quotaResetCron) {
        this.quotaResetCron = quotaResetCron;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(int retentionDays) {
        this.retentionDays = retentionDays;
    }

    public boolean isSchedulerEnabled() {
        return schedulerEnabled;
    }

    public void setSchedulerEnabled(boolean schedulerEnabled) {
        this.schedulerEnabled = schedulerEnabled;
    }

    public boolean isGnewsEnabled() {
        return gnewsEnabled;
    }

    public void setGnewsEnabled(boolean gnewsEnabled) {
        this.gnewsEnabled = gnewsEnabled;
    }

    public int getExecutorPoolSize() {
        return executorPoolSize;
    }

    public void setExecutorPoolSize(int executorPoolSize) {
        this.executorPoolSize = executorPoolSize;
    }

    public int getGnewsDailyLimit() {
        return gnewsDailyLimit;
    }

    public void setGnewsDailyLimit(int gnewsDailyLimit) {
        this.gnewsDailyLimit = gnewsDailyLimit;
    }

    public int getCacheTtlSeconds() {
        return cacheTtlSeconds;
    }

    public void setCacheTtlSeconds(int cacheTtlSeconds) {
        this.cacheTtlSeconds = cacheTtlSeconds;
    }

    public int getHealthyWithinHours() {
        return healthyWithinHours;
    }

    public void setHealthyWithinHours(int healthyWithinHours) {
        this.healthyWithinHours = healthyWithinHours;
    }

    public int getStaleWithinHours() {
        return staleWithinHours;
    }

    public void setStaleWithinHours(int staleWithinHours) {
        this.staleWithinHours = staleWithinHours;
    }
}
