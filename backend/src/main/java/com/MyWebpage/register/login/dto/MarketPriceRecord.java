package com.MyWebpage.register.login.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarketPriceRecord {

    @JsonProperty("State")
    private String state;

    @JsonProperty("District")
    private String district;

    @JsonProperty("Market")
    private String market;

    @JsonProperty("Commodity")
    private String commodity;

    @JsonProperty("Variety")
    private String variety;

    @JsonProperty("Grade")
    private String grade;

    @JsonProperty("Arrival_Date")
    private String arrivalDate;

    @JsonProperty("Min_Price")
    private Integer minPrice;

    @JsonProperty("Max_Price")
    private Integer maxPrice;

    @JsonProperty("Modal_Price")
    private Integer modalPrice;

    public String getState() { return state; }
    public String getDistrict() { return district; }
    public String getMarket() { return market; }
    public String getCommodity() { return commodity; }
    public String getVariety() { return variety; }
    public String getGrade() { return grade; }
    public String getArrivalDate() { return arrivalDate; }
    public Integer getMinPrice() { return minPrice; }
    public Integer getMaxPrice() { return maxPrice; }
    public Integer getModalPrice() { return modalPrice; }
}