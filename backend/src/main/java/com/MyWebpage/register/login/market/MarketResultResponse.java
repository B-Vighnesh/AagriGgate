package com.MyWebpage.register.login.market;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MarketResultResponse {

    private Long id;

    @JsonProperty("State")
    private String state;

    @JsonProperty("District")
    private String district;

    @JsonProperty("Market")
    private String market;

    @JsonProperty("Commodity")
    private String commodity;

    @JsonProperty("Commodity_Code")
    private String commodityCode;

    @JsonProperty("Variety")
    private String variety;

    @JsonProperty("Grade")
    private String grade;

    @JsonProperty("Arrival_Date")
    private LocalDate arrivalDate;

    @JsonProperty("Min_Price")
    private BigDecimal minPrice;

    @JsonProperty("Max_Price")
    private BigDecimal maxPrice;

    @JsonProperty("Modal_Price")
    private BigDecimal modalPrice;

    public static MarketResultResponse from(Market market) {
        MarketResultResponse response = new MarketResultResponse();
        response.id = market.getId();
        response.state = market.getState();
        response.district = market.getDistrict();
        response.market = market.getMarketName();
        response.commodity = market.getCommodity();
        response.commodityCode = market.getCommodityCode();
        response.variety = market.getVariety();
        response.grade = market.getGrade();
        response.arrivalDate = market.getArrivalDate();
        response.minPrice = market.getMinPrice();
        response.maxPrice = market.getMaxPrice();
        response.modalPrice = market.getModalPrice();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getState() {
        return state;
    }

    public String getDistrict() {
        return district;
    }

    public String getMarket() {
        return market;
    }

    public String getCommodity() {
        return commodity;
    }

    public String getCommodityCode() {
        return commodityCode;
    }

    public String getVariety() {
        return variety;
    }

    public String getGrade() {
        return grade;
    }

    public LocalDate getArrivalDate() {
        return arrivalDate;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }

    public BigDecimal getModalPrice() {
        return modalPrice;
    }
}
