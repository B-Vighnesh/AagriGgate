package com.MyWebpage.register.login.market.analytics;

import java.time.LocalDate;

public interface DailyCropPriceSummaryRefreshRepository {

    void refreshForDistrictDate(String state, String district, LocalDate date);
}
