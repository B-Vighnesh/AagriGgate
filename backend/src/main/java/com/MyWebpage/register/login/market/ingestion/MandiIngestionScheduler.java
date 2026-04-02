package com.MyWebpage.register.login.market.ingestion;

import com.MyWebpage.register.login.news.util.NewsTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MandiIngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(MandiIngestionScheduler.class);

    private final MandiIngestionService mandiIngestionService;

    public MandiIngestionScheduler(MandiIngestionService mandiIngestionService) {
        this.mandiIngestionService = mandiIngestionService;
    }

    @Scheduled(cron = "${market.api.ingestion-cron}", zone = "Asia/Kolkata")
    public void ingestYesterday() {
        LocalDate yesterday = LocalDate.now(NewsTime.IST).minusDays(1);
        int totalRows = 0;

        for (var entry : StateDistrictMapping.STATES_AND_DISTRICTS.entrySet()) {
            String state = entry.getKey();
            for (String district : entry.getValue()) {
                try {
                    totalRows += mandiIngestionService.ingestDistrict(state, district, yesterday);
                } catch (Exception exception) {
                    log.error("Failed to ingest mandi data for state={} district={} date={}", state, district, yesterday, exception);
                }
            }
        }

        log.info("Completed mandi ingestion for {} with {} rows processed", yesterday, totalRows);
    }
}
