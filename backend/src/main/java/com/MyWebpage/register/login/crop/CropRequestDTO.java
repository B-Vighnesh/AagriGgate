package com.MyWebpage.register.login.crop;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CropRequestDTO {
    @NotBlank
    @Size(min = 2, max = 100)
    private String cropName;
    @NotBlank
    private String cropType;
    @NotBlank
    private String region;
    @NotNull
    @Positive
    private Double marketPrice;
    @NotNull
    @Positive
    private Double quantity;
    private Long farmerId;
    private String unit;
    private String description;
    private Boolean isUrgent;
    private Boolean isWaste;
    private Double discountPrice;
    private String status;

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
    public Boolean getIsUrgent() { return isUrgent; }
    public void setIsUrgent(Boolean urgent) { isUrgent = urgent; }
    public Boolean getIsWaste() { return isWaste; }
    public void setIsWaste(Boolean waste) { isWaste = waste; }
    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
