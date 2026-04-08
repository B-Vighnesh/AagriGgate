package com.MyWebpage.register.login.market.analytics;

import com.MyWebpage.register.login.news.util.NewsTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

@Service
public class MarketAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(MarketAnalyticsService.class);

    private final DailyCropPriceSummaryRepository summaryRepository;

    public MarketAnalyticsService(DailyCropPriceSummaryRepository summaryRepository) {
        this.summaryRepository = summaryRepository;
    }

    public int refreshSummary(String state, String district, LocalDate date) {
        int rows = summaryRepository.refreshForDistrictDate(state, district, date);
        log.info("Refreshed {} daily summary rows for state={} district={} date={}", rows, state, district, date);
        return rows;
    }

    public List<MarketAnalyticsResponse.PriceTrendPoint> getPriceTrend(
            String commodity,
            String state,
            String district,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateWindow window = resolveWindow(fromDate, toDate, 30);
        return aggregateByDate(summaryRepository.findSeries(commodity, state, district, window.fromDate(), window.toDate()))
                .stream()
                .map(bucket -> new MarketAnalyticsResponse.PriceTrendPoint(
                        bucket.date(),
                        bucket.avgMinPrice(),
                        bucket.avgModalPrice(),
                        bucket.avgMaxPrice(),
                        bucket.marketCount(),
                        bucket.recordCount()
                ))
                .toList();
    }

    public List<MarketAnalyticsResponse.DistrictHeatmapPoint> getDistrictHeatmap(
            String commodity,
            String state,
            LocalDate summaryDate
    ) {
        LocalDate resolvedDate = summaryDate != null ? summaryDate : latestAvailableDate();
        return summaryRepository.findHeatmapRows(commodity, state, resolvedDate).stream()
                .sorted(Comparator.comparing(DailyCropPriceSummary::getAvgModalPrice,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(item -> new MarketAnalyticsResponse.DistrictHeatmapPoint(
                        item.getDistrict(),
                        scale(item.getAvgMinPrice()),
                        scale(item.getAvgModalPrice()),
                        scale(item.getAvgMaxPrice()),
                        item.getMarketCount(),
                        item.getRecordCount()
                ))
                .toList();
    }

    public List<MarketAnalyticsResponse.MinMaxModalTrendPoint> getMinMaxModalTrend(
            String commodity,
            String state,
            String district,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateWindow window = resolveWindow(fromDate, toDate, 30);
        return aggregateByDate(summaryRepository.findSeries(commodity, state, district, window.fromDate(), window.toDate()))
                .stream()
                .map(bucket -> new MarketAnalyticsResponse.MinMaxModalTrendPoint(
                        bucket.date(),
                        bucket.avgMinPrice(),
                        bucket.avgModalPrice(),
                        bucket.avgMaxPrice(),
                        volatility(bucket.avgMinPrice(), bucket.avgMaxPrice()),
                        bucket.marketCount(),
                        bucket.recordCount()
                ))
                .toList();
    }

    public List<MarketAnalyticsResponse.ArrivalVsPricePoint> getArrivalVsPrice(
            String commodity,
            String state,
            String district,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateWindow window = resolveWindow(fromDate, toDate, 30);
        return aggregateByDate(summaryRepository.findSeries(commodity, state, district, window.fromDate(), window.toDate()))
                .stream()
                .map(bucket -> new MarketAnalyticsResponse.ArrivalVsPricePoint(
                        bucket.date(),
                        bucket.marketCount(),
                        bucket.recordCount(),
                        bucket.avgModalPrice()
                ))
                .toList();
    }

    public List<MarketAnalyticsResponse.SeasonalTrendPoint> getSeasonalTrend(
            String commodity,
            String state,
            String district,
            Integer year,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateWindow window = resolveSeasonalWindow(year, fromDate, toDate);
        List<DailyCropPriceSummary> series = summaryRepository.findSeries(commodity, state, district, window.fromDate(), window.toDate());

        Map<Integer, List<DailyCropPriceSummary>> byMonth = new TreeMap<>();
        for (DailyCropPriceSummary row : series) {
            byMonth.computeIfAbsent(row.getSummaryDate().getMonthValue(), ignored -> new ArrayList<>()).add(row);
        }

        List<MarketAnalyticsResponse.SeasonalTrendPoint> response = new ArrayList<>();
        for (Map.Entry<Integer, List<DailyCropPriceSummary>> entry : byMonth.entrySet()) {
            AggregatedBucket bucket = aggregateRows(null, entry.getValue());
            response.add(new MarketAnalyticsResponse.SeasonalTrendPoint(
                    entry.getKey(),
                    Month.of(entry.getKey()).name().toLowerCase(Locale.ENGLISH),
                    bucket.avgMinPrice(),
                    bucket.avgModalPrice(),
                    bucket.avgMaxPrice(),
                    bucket.marketCount(),
                    bucket.recordCount()
            ));
        }
        return response;
    }

    private List<AggregatedBucket> aggregateByDate(List<DailyCropPriceSummary> rows) {
        Map<LocalDate, List<DailyCropPriceSummary>> grouped = new LinkedHashMap<>();
        for (DailyCropPriceSummary row : rows) {
            grouped.computeIfAbsent(row.getSummaryDate(), ignored -> new ArrayList<>()).add(row);
        }

        List<AggregatedBucket> buckets = new ArrayList<>();
        for (Map.Entry<LocalDate, List<DailyCropPriceSummary>> entry : grouped.entrySet()) {
            buckets.add(aggregateRows(entry.getKey(), entry.getValue()));
        }
        return buckets;
    }

    private AggregatedBucket aggregateRows(LocalDate date, List<DailyCropPriceSummary> rows) {
        BigDecimal minWeighted = BigDecimal.ZERO;
        BigDecimal modalWeighted = BigDecimal.ZERO;
        BigDecimal maxWeighted = BigDecimal.ZERO;
        long marketCount = 0;
        long recordCount = 0;

        for (DailyCropPriceSummary row : rows) {
            long weight = Math.max(row.getRecordCount(), 1);
            marketCount += row.getMarketCount();
            recordCount += row.getRecordCount();

            minWeighted = minWeighted.add(safe(row.getAvgMinPrice()).multiply(BigDecimal.valueOf(weight)));
            modalWeighted = modalWeighted.add(safe(row.getAvgModalPrice()).multiply(BigDecimal.valueOf(weight)));
            maxWeighted = maxWeighted.add(safe(row.getAvgMaxPrice()).multiply(BigDecimal.valueOf(weight)));
        }

        if (recordCount == 0) {
            return new AggregatedBucket(date, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0, 0);
        }

        BigDecimal divisor = BigDecimal.valueOf(recordCount);
        return new AggregatedBucket(
                date,
                scale(minWeighted.divide(divisor, 2, RoundingMode.HALF_UP)),
                scale(modalWeighted.divide(divisor, 2, RoundingMode.HALF_UP)),
                scale(maxWeighted.divide(divisor, 2, RoundingMode.HALF_UP)),
                marketCount,
                recordCount
        );
    }

    private DateWindow resolveWindow(LocalDate fromDate, LocalDate toDate, int defaultDays) {
        LocalDate latest = latestAvailableDate();
        LocalDate resolvedTo = toDate != null ? toDate : latest;
        LocalDate resolvedFrom = fromDate != null ? fromDate : resolvedTo.minusDays(defaultDays - 1L);
        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new IllegalArgumentException("fromDate must be before or equal to toDate");
        }
        return new DateWindow(resolvedFrom, resolvedTo);
    }

    private DateWindow resolveSeasonalWindow(Integer year, LocalDate fromDate, LocalDate toDate) {
        if (year != null) {
            return new DateWindow(LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        }
        return resolveWindow(fromDate, toDate, 365);
    }

    private LocalDate latestAvailableDate() {
        return summaryRepository.findLatestSummaryDate()
                .orElse(LocalDate.now(NewsTime.IST).minusDays(1));
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal scale(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal volatility(BigDecimal minPrice, BigDecimal maxPrice) {
        return scale(safe(maxPrice).subtract(safe(minPrice)));
    }

    private record DateWindow(LocalDate fromDate, LocalDate toDate) {
    }

    private record AggregatedBucket(
            LocalDate date,
            BigDecimal avgMinPrice,
            BigDecimal avgModalPrice,
            BigDecimal avgMaxPrice,
            long marketCount,
            long recordCount
    ) {
    }
}
