package com.MyWebpage.register.login.market;

import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/market", "/api/v1/market-price"})
public class MarketController {

    private final MarketQueryService marketQueryService;

    public MarketController(MarketQueryService marketQueryService) {
        this.marketQueryService = marketQueryService;
    }

    @GetMapping
    public ApiResponse<?> getMarketPrice(
            @RequestParam String crop,
            @RequestParam String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) LocalDate arrivalDate,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (crop == null || crop.isBlank()) {
            throw new IllegalArgumentException("crop parameter is required");
        }
        if (state == null || state.isBlank()) {
            throw new IllegalArgumentException("state parameter is required");
        }

        LocalDate resolvedFrom = fromDate;
        LocalDate resolvedTo = toDate;
        if (arrivalDate != null && resolvedFrom == null && resolvedTo == null) {
            resolvedFrom = arrivalDate;
            resolvedTo = arrivalDate;
        }

        return ApiResponse.success(
                "Market data fetched",
                marketQueryService.search(new MarketSearchRequest(
                        crop,
                        state,
                        district,
                        resolvedFrom,
                        resolvedTo,
                        priceMin,
                        priceMax
                ), page, size)
        );
    }
}
