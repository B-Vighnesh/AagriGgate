package com.MyWebpage.register.login.market.mandi;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketSearchRequest(
        String crop,
        String state,
        String district,
        LocalDate fromDate,
        LocalDate toDate,
        BigDecimal priceMin,
        BigDecimal priceMax
) {
}
