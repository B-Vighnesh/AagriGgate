package com.MyWebpage.register.login.market;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MarketPriceResponse {

    @JsonProperty("records")
    private List<MarketPriceRecord> records;

    public List<MarketPriceRecord> getRecords() {
        return records;
    }
}