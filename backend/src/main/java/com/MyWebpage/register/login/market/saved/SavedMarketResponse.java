package com.MyWebpage.register.login.market.saved;

import com.MyWebpage.register.login.market.mandi.Market;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SavedMarketResponse {

    private Long id;
    private Long marketId;
    private String note;
    private LocalDateTime savedAt;

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

    public static SavedMarketResponse from(SavedMarket savedMarket) {
        Market marketEntity = savedMarket.getMarket();
        SavedMarketResponse response = new SavedMarketResponse();
        response.id = savedMarket.getId();
        response.marketId = marketEntity.getId();
        response.note = savedMarket.getNote();
        response.savedAt = savedMarket.getSavedAt();
        response.state = marketEntity.getState();
        response.district = marketEntity.getDistrict();
        response.market = marketEntity.getMarketName();
        response.commodity = marketEntity.getCommodity();
        response.commodityCode = marketEntity.getCommodityCode();
        response.variety = marketEntity.getVariety();
        response.grade = marketEntity.getGrade();
        response.arrivalDate = marketEntity.getArrivalDate();
        response.minPrice = marketEntity.getMinPrice();
        response.maxPrice = marketEntity.getMaxPrice();
        response.modalPrice = marketEntity.getModalPrice();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getMarketId() {
        return marketId;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
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
