package com.MyWebpage.register.login.weather;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeatherScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WeatherScheduler.class);

    private final WeatherService weatherService;

    public WeatherScheduler(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Scheduled(cron = "${weather.scheduler-cron}", zone = "Asia/Kolkata")
    public void refreshKarnatakaSnapshots() {
        logger.info("Refreshing scheduled weather snapshots for Karnataka districts");
        weatherService.refreshScheduledWeatherSnapshots();
    }
}
