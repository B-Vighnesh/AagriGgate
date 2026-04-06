package com.MyWebpage.register.login.market.ingestion;

import com.MyWebpage.register.login.market.Market;
import com.MyWebpage.register.login.market.MarketRepository;
import com.MyWebpage.register.login.news.util.NewsTime;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class MandiIngestionService {

    private static final Logger log = LoggerFactory.getLogger(MandiIngestionService.class);
    private static final DateTimeFormatter API_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ENGLISH);

    private final MandiApiClient mandiApiClient;
    private final MandiDataTransformer mandiDataTransformer;
    private final MarketRepository marketRepository;

    public MandiIngestionService(
            MandiApiClient mandiApiClient,
            MandiDataTransformer mandiDataTransformer,
            MarketRepository marketRepository
    ) {
        this.mandiApiClient = mandiApiClient;
        this.mandiDataTransformer = mandiDataTransformer;
        this.marketRepository = marketRepository;
    }

    @Transactional
    public int ingestDistrict(String state, String district, LocalDate date) {
        JsonNode root = mandiApiClient.fetchMarketData(state, district, date.format(API_DATE_FORMAT));
        List<Market> markets = mandiDataTransformer.transform(root);
        LocalDateTime createdAt = LocalDateTime.now(NewsTime.IST);
        markets.forEach(market -> market.setCreatedAt(createdAt));
        marketRepository.batchInsertIgnore(markets);
        log.info("Ingested {} market rows for state={} district={} date={}", markets.size(), state, district, date);
        return markets.size();
    }
}
