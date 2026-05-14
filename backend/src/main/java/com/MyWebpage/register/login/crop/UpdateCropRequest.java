package com.MyWebpage.register.login.crop;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


    public class UpdateCropRequest {

        @NotBlank(message = "Crop name is required")
        private String cropName;

        @NotBlank(message = "Crop type is required")
        private String cropType;

        @NotBlank(message = "Region is required")
        private String region;

        @NotNull(message = "Market price is required")
        @Min(value = 0, message = "Market price cannot be negative")
        private Double marketPrice;

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        private Double quantity;

        @NotBlank(message = "Unit is required")
        private String unit;

        @NotBlank(message = "Description is required")
        private String description;

        @NotBlank(message = "Status is required")
        private String status;

        @NotNull(message = "Discount price is required")
        @Min(value = 0, message = "Discount price cannot be negative")
        private Double discountPrice;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "District is required")
        private String district;

        private boolean isUrgent;
        private boolean isWaste;

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Double getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(Double marketPrice) {
        this.marketPrice = marketPrice;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(Double discountPrice) {
        this.discountPrice = discountPrice;
    }

    public boolean isUrgent() {
        return isUrgent;
    }

    public void setUrgent(boolean urgent) {
        isUrgent = urgent;
    }

    public boolean isWaste() {
        return isWaste;
    }

    public void setWaste(boolean waste) {
        isWaste = waste;
    }
}