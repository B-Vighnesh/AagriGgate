package com.MyWebpage.register.login.model;

import jakarta.persistence.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Date;


@Entity
@Component
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "crop_seq")
    @SequenceGenerator(name = "crop_seq", sequenceName = "crop_sequence", initialValue = 10011, allocationSize = 1)
    private Long cropID;


    private String cropName;
    private String cropType;
    private String region;
    private Double marketPrice;
    private Double quantity;
    private String imageName;
    private String imageType;
    private String unit;
    private String description;
    @Lob
    private byte[] imageData;
    @ManyToOne
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;
    private String postDate;

    public String getPostDate() {
        return postDate;
    }

    public void setPostDate(String postDate) {
        this.postDate = postDate;
    }

    public Crop() {}

    public Crop(String cropName, String cropType, String region, Double marketPrice, Double quantity, Farmer farmer) {
        this.cropName = cropName;
        this.cropType = cropType;
        this.region = region;
        this.marketPrice = marketPrice;
        this.quantity = quantity;
        this.farmer = farmer;
    }

    @Override
    public String toString() {
        return "Crop{" +
                "cropID=" + cropID +
                ", cropName='" + cropName + '\'' +
                ", cropType='" + cropType + '\'' +
                ", region='" + region + '\'' +
                ", marketPrice=" + marketPrice +
                ", quantity=" + quantity +
                ", imageName='" + imageName + '\'' +
                ", imageType='" + imageType + '\'' +
                ", unit='" + unit + '\'' +
                ", description='" + description + '\'' +
                ", imageData=" + Arrays.toString(imageData) +
                ", farmer=" + farmer +
                '}';
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    //    @Override
//    public String toString() {
//        return "Crop{" +
//                "cropID=" + cropID +
//                ", cropName='" + cropName + '\'' +
//                ", cropType='" + cropType + '\'' +
//                ", region='" + region + '\'' +
//                ", marketPrice=" + marketPrice +
//                ", quantity=" + quantity +
//                ", farmer=" + farmer +
//                '}';
//    }

    public Long getCropID() {
        return cropID;
    }

    public void setCropID(Long cropID) {
        this.cropID = cropID;
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

    public Farmer getFarmer() {
        return farmer;
    }

    public void setFarmer(Farmer farmer) {
        this.farmer = farmer;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }
}
