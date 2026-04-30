package com.MyWebpage.register.login.approach;

import java.time.LocalDateTime;

public class ApproachRequestDTO {
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
    private Double requestedQuantity;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime lastMessageAt;
    private LocalDateTime notifiedAt;
    private LocalDateTime completedAt;
    private LocalDateTime failedAt;
    private LocalDateTime expiredAt;

    public ApproachRequestDTO() {
    }

    public ApproachRequestDTO(
            Long approachId,
            Long cropId,
            String cropName,
            Long farmerId,
            String farmerName,
            String farmerPhoneNo,
            String farmerEmail,
            String farmerLocation,
            Long userId,
            String userName,
            String userPhoneNo,
            String userEmail,
            Double requestedQuantity,
            String status,
            LocalDateTime requestedAt,
            LocalDateTime acceptedAt,
            LocalDateTime rejectedAt,
            LocalDateTime lastMessageAt,
            LocalDateTime notifiedAt,
            LocalDateTime completedAt,
            LocalDateTime failedAt,
            LocalDateTime expiredAt
    ) {
        this.approachId = approachId;
        this.cropId = cropId;
        this.cropName = cropName;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.farmerPhoneNo = farmerPhoneNo;
        this.farmerEmail = farmerEmail;
        this.farmerLocation = farmerLocation;
        this.userId = userId;
        this.userName = userName;
        this.userPhoneNo = userPhoneNo;
        this.userEmail = userEmail;
        this.requestedQuantity = requestedQuantity;
        this.status = status;
        this.requestedAt = requestedAt;
        this.acceptedAt = acceptedAt;
        this.rejectedAt = rejectedAt;
        this.lastMessageAt = lastMessageAt;
        this.notifiedAt = notifiedAt;
        this.completedAt = completedAt;
        this.failedAt = failedAt;
        this.expiredAt = expiredAt;
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

    public Double getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Double requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public LocalDateTime getNotifiedAt() {
        return notifiedAt;
    }

    public void setNotifiedAt(LocalDateTime notifiedAt) {
        this.notifiedAt = notifiedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getFailedAt() {
        return failedAt;
    }

    public void setFailedAt(LocalDateTime failedAt) {
        this.failedAt = failedAt;
    }

    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(LocalDateTime expiredAt) {
        this.expiredAt = expiredAt;
    }
}
