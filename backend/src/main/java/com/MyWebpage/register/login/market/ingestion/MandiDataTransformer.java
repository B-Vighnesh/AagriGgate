package com.MyWebpage.register.login.market.ingestion;

import com.MyWebpage.register.login.market.Market;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class MandiDataTransformer {

    private static final DateTimeFormatter API_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ENGLISH);

    public List<Market> transform(JsonNode root) {
        List<Market> markets = new ArrayList<>();
        if (root == null || !root.path("records").isArray()) {
            return markets;
        }

        for (JsonNode record : root.path("records")) {
            Market market = new Market();
            market.setState(clean(record.path("State").asText(null)));
            market.setDistrict(clean(record.path("District").asText(null)));
            market.setMarketName(clean(record.path("Market").asText(null)));
            market.setCommodity(clean(record.path("Commodity").asText(null)));
            market.setCommodityCode(clean(record.path("Commodity_Code").asText(null)));
            market.setVariety(cleanOrEmpty(record.path("Variety").asText(null)));
            market.setGrade(cleanOrEmpty(record.path("Grade").asText(null)));
            market.setArrivalDate(parseDate(record.path("Arrival_Date").asText(null)));
            market.setMinPrice(parseDecimal(record.path("Min_Price").asText(null)));
            market.setMaxPrice(parseDecimal(record.path("Max_Price").asText(null)));
            market.setModalPrice(parseDecimal(record.path("Modal_Price").asText(null)));
            market.setCreatedAt(LocalDateTime.now());

            if (market.getState() == null
                    || market.getDistrict() == null
                    || market.getMarketName() == null
                    || market.getCommodity() == null
                    || market.getArrivalDate() == null) {
                continue;
            }
            markets.add(market);
        }

        return markets;
    }

    private LocalDate parseDate(String value) {
        String cleaned = clean(value);
        if (cleaned == null) {
            return null;
        }
        return LocalDate.parse(cleaned, API_DATE_FORMAT);
    }

    private BigDecimal parseDecimal(String value) {
        String cleaned = clean(value);
        if (cleaned == null) {
            return null;
        }
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String cleanOrEmpty(String value) {
        String cleaned = clean(value);
        return cleaned == null ? "" : cleaned;
    }
}
