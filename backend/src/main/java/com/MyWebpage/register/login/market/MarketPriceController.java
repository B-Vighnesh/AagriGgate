package com.MyWebpage.register.login.market;

import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market-price")
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    public ApiResponse<?> getMarketPrice(
            @RequestParam String crop,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String arrivalDate) {
        return ApiResponse.success(
                "Market price fetched",
                marketPriceService.getMarketPrice(crop, state, district, arrivalDate));
    }
}
