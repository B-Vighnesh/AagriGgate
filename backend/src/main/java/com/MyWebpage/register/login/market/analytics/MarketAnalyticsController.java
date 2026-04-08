package com.MyWebpage.register.login.market.analytics;

import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/market/analytics")
public class MarketAnalyticsController {

    private final MarketAnalyticsService marketAnalyticsService;

    public MarketAnalyticsController(MarketAnalyticsService marketAnalyticsService) {
        this.marketAnalyticsService = marketAnalyticsService;
    }

    @GetMapping("/price-trend")
    public ApiResponse<List<MarketAnalyticsResponse.PriceTrendPoint>> getPriceTrend(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return ApiResponse.success(
                "Price trend analytics fetched",
                marketAnalyticsService.getPriceTrend(commodity, state, district, fromDate, toDate)
        );
    }

    @GetMapping("/heatmap")
    public ApiResponse<List<MarketAnalyticsResponse.DistrictHeatmapPoint>> getHeatmap(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam(required = false) LocalDate date
    ) {
        return ApiResponse.success(
                "District heatmap analytics fetched",
                marketAnalyticsService.getDistrictHeatmap(commodity, state, date)
        );
    }

    @GetMapping("/min-max-modal-trend")
    public ApiResponse<List<MarketAnalyticsResponse.MinMaxModalTrendPoint>> getMinMaxModalTrend(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return ApiResponse.success(
                "Min, max, and modal trend analytics fetched",
                marketAnalyticsService.getMinMaxModalTrend(commodity, state, district, fromDate, toDate)
        );
    }

    @GetMapping("/arrival-vs-price")
    public ApiResponse<List<MarketAnalyticsResponse.ArrivalVsPricePoint>> getArrivalVsPrice(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return ApiResponse.success(
                "Arrival versus price analytics fetched",
                marketAnalyticsService.getArrivalVsPrice(commodity, state, district, fromDate, toDate)
        );
    }

    @GetMapping("/seasonal-trend")
    public ApiResponse<List<MarketAnalyticsResponse.SeasonalTrendPoint>> getSeasonalTrend(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return ApiResponse.success(
                "Seasonal trend analytics fetched",
                marketAnalyticsService.getSeasonalTrend(commodity, state, district, year, fromDate, toDate)
        );
    }
}
