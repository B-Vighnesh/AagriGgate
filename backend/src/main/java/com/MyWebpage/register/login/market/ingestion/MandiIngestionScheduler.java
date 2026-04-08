package com.MyWebpage.register.login.market.ingestion;

import com.MyWebpage.register.login.news.util.NewsTime;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class MandiIngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(MandiIngestionScheduler.class);

    private final MandiIngestionService mandiIngestionService;

    @Value("${market.api.ingest-on-startup}")
    private boolean ingestOnStartup;

    @Value("${market.api.startup-state:Karnataka}")
    private String startupState;

    public MandiIngestionScheduler(MandiIngestionService mandiIngestionService) {
        this.mandiIngestionService = mandiIngestionService;
    }

    @PostConstruct
    public void ingestYesterdayOnStartup() {
        System.out.println("[MARKET_STARTUP] Scheduler loaded. ingestOnStartup=" + ingestOnStartup
                + ", startupState=" + startupState);

        if (!ingestOnStartup) {
            System.out.println("[MARKET_STARTUP] Skipping startup ingestion because market.api.ingest-on-startup=false");
            log.info("Skipping mandi startup ingestion because market.api.ingest-on-startup is disabled");
            return;
        }

        LocalDate yesterday = LocalDate.now(NewsTime.IST).minusDays(1);
        int totalRows = 0;
        List<String> districts = StateDistrictMapping.STATES_AND_DISTRICTS.getOrDefault(startupState, List.of());

        System.out.println("[MARKET_STARTUP] Starting ingestion for state=" + startupState
                + ", districts=" + districts.size() + ", date=" + yesterday);

        for (String district : districts) {
            System.out.println("[MARKET_STARTUP] Starting district=" + district + ", date=" + yesterday);
            try {
                int rows = mandiIngestionService.ingestDistrict(startupState, district, yesterday);
                totalRows += rows;
                System.out.println("[MARKET_STARTUP] Success. Processed rows=" + rows
                        + " for state=" + startupState + ", district=" + district + ", date=" + yesterday);
            } catch (Exception exception) {
                System.out.println("[MARKET_STARTUP] Failed for state=" + startupState
                        + ", district=" + district + ", date=" + yesterday
                        + ", reason=" + exception.getMessage());
                log.error(
                        "Failed mandi startup ingestion for state={} district={} date={}",
                        startupState,
                        district,
                        yesterday,
                        exception
                );
            }
        }

        System.out.println("[MARKET_STARTUP] Completed startup ingestion for state=" + startupState
                + ", districts=" + districts.size() + ", totalRows=" + totalRows + ", date=" + yesterday);
        log.info("Completed mandi startup ingestion for state={} districts={} date={} totalRows={}",
                startupState, districts.size(), yesterday, totalRows);
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
