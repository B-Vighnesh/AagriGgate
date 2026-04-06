package com.MyWebpage.register.login.market.ingestion;

import com.MyWebpage.register.login.news.util.NewsTime;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MandiIngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(MandiIngestionScheduler.class);

    private final MandiIngestionService mandiIngestionService;

    @Value("${market.api.ingest-on-startup:false}")
    private boolean ingestOnStartup;

    @Value("${market.api.startup-state:Karnataka}")
    private String startupState;

    @Value("${market.api.startup-district:Bangalore}")
    private String startupDistrict;

    public MandiIngestionScheduler(MandiIngestionService mandiIngestionService) {
        this.mandiIngestionService = mandiIngestionService;
    }

    @PostConstruct
    public void ingestYesterdayOnStartup() {
        System.out.println("[MARKET_STARTUP] Scheduler loaded. ingestOnStartup=" + ingestOnStartup
                + ", state=" + startupState + ", district=" + startupDistrict);

        if (!ingestOnStartup) {
            System.out.println("[MARKET_STARTUP] Skipping startup ingestion because market.api.ingest-on-startup=false");
            log.info("Skipping mandi startup ingestion because market.api.ingest-on-startup is disabled");
            return;
        }

        LocalDate yesterday = LocalDate.now(NewsTime.IST).minusDays(1);
        System.out.println("[MARKET_STARTUP] Starting ingestion for state=" + startupState
                + ", district=" + startupDistrict + ", date=" + yesterday);

        try {
            int rows = mandiIngestionService.ingestDistrict(startupState, startupDistrict, yesterday);
            System.out.println("[MARKET_STARTUP] Success. Inserted/processed rows=" + rows
                    + " for state=" + startupState + ", district=" + startupDistrict + ", date=" + yesterday);
            log.info(
                    "Completed mandi startup ingestion for state={} district={} date={} rows={}",
                    startupState,
                    startupDistrict,
                    yesterday,
                    rows
            );
        } catch (Exception exception) {
            System.out.println("[MARKET_STARTUP] Failed for state=" + startupState
                    + ", district=" + startupDistrict + ", date=" + yesterday
                    + ", reason=" + exception.getMessage());
            log.error(
                    "Failed mandi startup ingestion for state={} district={} date={}",
                    startupState,
                    startupDistrict,
                    yesterday,
                    exception
            );
        }
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
