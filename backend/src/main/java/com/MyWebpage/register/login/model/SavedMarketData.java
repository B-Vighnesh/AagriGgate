package com.MyWebpage.register.login.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "saved_market_data")
public class SavedMarketData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 private String farmerId;
    @JsonProperty("Arrival_Date")
    private String arrivalDate;

    @JsonProperty("Commodity")
    private String commodity;

    @JsonProperty("Commodity_Code")
    private String commodityCode;

    @JsonProperty("District")
    private String district;

    @JsonProperty("Grade")
    private String grade;

    @JsonProperty("Market")
    private String market;

    @JsonProperty("Max_Price")
    private String maxPrice;

    @JsonProperty("Min_Price")
    private String minPrice;

    @JsonProperty("Modal_Price")
    private String modalPrice;

    @JsonProperty("State")
    private String state;

    @JsonProperty("Variety")
    private String variety;

    @Override
    public String toString() {
        return "SavedMarketData{" +
                "id=" + id +
                ", farmerId=" + farmerId +
                ", arrivalDate='" + arrivalDate + '\'' +
                ", commodity='" + commodity + '\'' +
                ", commodityCode='" + commodityCode + '\'' +
                ", district='" + district + '\'' +
                ", grade='" + grade + '\'' +
                ", market='" + market + '\'' +
                ", maxPrice='" + maxPrice + '\'' +
                ", minPrice='" + minPrice + '\'' +
                ", modalPrice='" + modalPrice + '\'' +
                ", state='" + state + '\'' +
                ", variety='" + variety + '\'' +
                '}';
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getModalPrice() {
        return modalPrice;
    }

    public void setModalPrice(String modalPrice) {
        this.modalPrice = modalPrice;
    }

    public String getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(String minPrice) {
        this.minPrice = minPrice;
    }

    public String getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(String maxPrice) {
        this.maxPrice = maxPrice;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCommodityCode() {
        return commodityCode;
    }

    public void setCommodityCode(String commodityCode) {
        this.commodityCode = commodityCode;
    }

    public String getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(String arrivalDate) {
        this.arrivalDate = arrivalDate;
    }

    public String getCommodity() {
        return commodity;
    }

    public void setCommodity(String commodity) {
        this.commodity = commodity;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }
}
