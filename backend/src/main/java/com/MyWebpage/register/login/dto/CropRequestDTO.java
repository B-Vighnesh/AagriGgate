package com.MyWebpage.register.login.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CropRequestDTO {
    @NotBlank
    private String cropName;
    @NotBlank
    private String cropType;
    @NotBlank
    private String region;
    @NotNull
    private Double marketPrice;
    @NotNull
    private Double quantity;
    @NotNull
    private Long farmerId;
    private String unit;
    private String description;

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }
    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public Double getMarketPrice() { return marketPrice; }
    public void setMarketPrice(Double marketPrice) { this.marketPrice = marketPrice; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
