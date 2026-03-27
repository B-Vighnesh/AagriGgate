package com.MyWebpage.register.login.favorite;

public class FavoriteItemDTO {
    private Long favoriteId;
    private Long cropId;
    private String cropName;
    private String cropType;
    private String region;
    private Double marketPrice;
    private Double quantity;
    private String unit;
    private String farmerName;
    private Boolean isUrgent;
    private Boolean isWaste;
    private Double discountPrice;
    private String status;
    private String postDate;

    public FavoriteItemDTO() {
    }

    public FavoriteItemDTO(Long favoriteId, Long cropId, String cropName, String cropType, String region, Double marketPrice, Double quantity, String unit, String farmerName, Boolean isUrgent, Boolean isWaste, Double discountPrice, String status, String postDate) {
        this.favoriteId = favoriteId;
        this.cropId = cropId;
        this.cropName = cropName;
        this.cropType = cropType;
        this.region = region;
        this.marketPrice = marketPrice;
        this.quantity = quantity;
        this.unit = unit;
        this.farmerName = farmerName;
        this.isUrgent = isUrgent;
        this.isWaste = isWaste;
        this.discountPrice = discountPrice;
        this.status = status;
        this.postDate = postDate;
    }

    public Long getFavoriteId() { return favoriteId; }
    public void setFavoriteId(Long favoriteId) { this.favoriteId = favoriteId; }
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
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    public Boolean getIsUrgent() { return isUrgent; }
    public void setIsUrgent(Boolean urgent) { isUrgent = urgent; }
    public Boolean getIsWaste() { return isWaste; }
    public void setIsWaste(Boolean waste) { isWaste = waste; }
    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPostDate() { return postDate; }
    public void setPostDate(String postDate) { this.postDate = postDate; }
}
