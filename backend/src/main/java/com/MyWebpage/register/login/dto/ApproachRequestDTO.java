package com.MyWebpage.register.login.dto;

public class ApproachRequestDTO {
    private Long approachId;
    private Long cropId;
    private String cropName;
    private Long farmerId;
    private String farmerName;
    private Long userId;
    private String userName;
    private String status;

    public ApproachRequestDTO() {
    }

    public ApproachRequestDTO(
            Long approachId,
            Long cropId,
            String cropName,
            Long farmerId,
            String farmerName,
            Long userId,
            String userName,
            String status
    ) {
        this.approachId = approachId;
        this.cropId = cropId;
        this.cropName = cropName;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
