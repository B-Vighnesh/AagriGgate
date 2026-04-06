package com.MyWebpage.register.login.market.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class MarketAnalyticsResponse {

    private MarketAnalyticsResponse() {
    }

    public record PriceTrendPoint(
            LocalDate date,
            BigDecimal avgMinPrice,
            BigDecimal avgModalPrice,
            BigDecimal avgMaxPrice,
            long marketCount,
            long recordCount
    ) {
    }

    public record DistrictHeatmapPoint(
            String district,
            BigDecimal avgMinPrice,
            BigDecimal avgModalPrice,
            BigDecimal avgMaxPrice,
            long marketCount,
            long recordCount
    ) {
    }

    public record MinMaxModalTrendPoint(
            LocalDate date,
            BigDecimal avgMinPrice,
            BigDecimal avgModalPrice,
            BigDecimal avgMaxPrice,
            BigDecimal volatility,
            long marketCount,
            long recordCount
    ) {
    }

    public record ArrivalVsPricePoint(
            LocalDate date,
            long marketCount,
            long recordCount,
            BigDecimal avgModalPrice
    ) {
    }

    public record SeasonalTrendPoint(
            int month,
            String monthName,
            BigDecimal avgMinPrice,
            BigDecimal avgModalPrice,
            BigDecimal avgMaxPrice,
            long marketCount,
            long recordCount
    ) {
    }
}
