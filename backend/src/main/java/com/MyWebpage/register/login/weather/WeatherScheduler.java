package com.MyWebpage.register.login.weather;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeatherScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WeatherScheduler.class);

    private final WeatherService weatherService;

    @Value("${weather.api.ingest-on-startup}")
    private boolean ingestOnStartup;

    public WeatherScheduler(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @PostConstruct
    public void refreshOnStartup() {
        logger.info("Weather scheduler loaded. ingestOnStartup={}", ingestOnStartup);
        if (!ingestOnStartup) {
            logger.info("Skipping weather startup ingestion because weather.api.ingest-on-startup is disabled");
            return;
        }
        logger.info("Starting weather startup ingestion for Karnataka districts");
        weatherService.refreshScheduledWeatherSnapshots();
        logger.info("Completed weather startup ingestion for Karnataka districts");
    }

    @Scheduled(cron = "${weather.scheduler-cron}", zone = "Asia/Kolkata")
    public void refreshKarnatakaSnapshots() {
        logger.info("Refreshing scheduled weather snapshots for Karnataka districts");
        weatherService.refreshScheduledWeatherSnapshots();
    }
}
