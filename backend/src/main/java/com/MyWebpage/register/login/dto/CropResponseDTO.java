package com.MyWebpage.register.login.dto;

public class CropResponseDTO {
    private Long cropId;
    private String cropName;
    private String cropType;
    private String region;
    private Double marketPrice;
    private Double quantity;
    private String unit;
    private String description;
    private String postDate;
    private String farmerName;

    public CropResponseDTO() {
    }

    public CropResponseDTO(
            Long cropId,
            String cropName,
            String cropType,
            String region,
            Double marketPrice,
            Double quantity,
            String unit,
            String description,
            String postDate,
            String farmerName
    ) {
        this.cropId = cropId;
        this.cropName = cropName;
        this.cropType = cropType;
        this.region = region;
        this.marketPrice = marketPrice;
        this.quantity = quantity;
        this.unit = unit;
        this.description = description;
        this.postDate = postDate;
        this.farmerName = farmerName;
    }

    public Long getCropId() { return cropId; }
    public void setCropId(Long cropId) { this.cropId = cropId; }
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
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPostDate() { return postDate; }
    public void setPostDate(String postDate) { this.postDate = postDate; }
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
}
