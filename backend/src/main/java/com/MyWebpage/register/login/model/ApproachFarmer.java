package com.MyWebpage.register.login.model;
import jakarta.persistence.*;

@Entity
@Table(name = "approach_farmer")
public class ApproachFarmer {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "approach_seq")
    @SequenceGenerator(name = "approach_seq", sequenceName = "approach_sequence", initialValue = 1000, allocationSize = 1)
    private Long approachId;
    private Long cropId;
    private String cropName;

    private Long farmerId;
    private String farmerName;
    private String farmerPhoneNo;
    private String farmerEmail;
    private String farmerLocation;

    private Long userId;
    private String userName;
    private String userPhoneNo;
    private String userEmail;

    private boolean accept;
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isAccept() {
        return accept;
    }

    public void setAccept(boolean accept) {
        this.accept = accept;
    }

    // Getters and Setters
    public Long getApproachId() {
        return approachId;
    }

    public void setApproachId(Long approachId) {
        this.approachId = approachId;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerPhoneNo() {
        return farmerPhoneNo;
    }

    public void setFarmerPhoneNo(String farmerPhoneNo) {
        this.farmerPhoneNo = farmerPhoneNo;
    }

    public String getFarmerEmail() {
        return farmerEmail;
    }

    public void setFarmerEmail(String farmerEmail) {
        this.farmerEmail = farmerEmail;
    }

    public String getFarmerLocation() {
        return farmerLocation;
    }

    public void setFarmerLocation(String farmerLocation) {
        this.farmerLocation = farmerLocation;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhoneNo() {
        return userPhoneNo;
    }

    public void setUserPhoneNo(String userPhoneNo) {
        this.userPhoneNo = userPhoneNo;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
