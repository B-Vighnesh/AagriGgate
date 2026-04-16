package com.MyWebpage.register.login.notification.dto.response;

public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String deliveryType;
    private String categoryName;
    private String severity;
    private Boolean isRead;
    private Boolean isAcknowledged;
    private Integer repeatIntervalMinutes;
    private String expiresAt;
    private String referenceType;
    private Long referenceId;
    private String targetType;
    private String locationState;
    private String locationDistrict;
    private String redirectUrl;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
    public Boolean getIsAcknowledged() { return isAcknowledged; }
    public void setIsAcknowledged(Boolean acknowledged) { isAcknowledged = acknowledged; }
    public Integer getRepeatIntervalMinutes() { return repeatIntervalMinutes; }
    public void setRepeatIntervalMinutes(Integer repeatIntervalMinutes) { this.repeatIntervalMinutes = repeatIntervalMinutes; }
    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getLocationState() { return locationState; }
    public void setLocationState(String locationState) { this.locationState = locationState; }
    public String getLocationDistrict() { return locationDistrict; }
    public void setLocationDistrict(String locationDistrict) { this.locationDistrict = locationDistrict; }
    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
