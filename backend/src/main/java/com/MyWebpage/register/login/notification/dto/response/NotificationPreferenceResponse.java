package com.MyWebpage.register.login.notification.dto.response;

public class NotificationPreferenceResponse {

    private String categoryName;
    private String description;
    private String defaultDeliveryType;
    private String effectiveDeliveryType;
    private String userSelectedDeliveryType;

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDefaultDeliveryType() { return defaultDeliveryType; }
    public void setDefaultDeliveryType(String defaultDeliveryType) { this.defaultDeliveryType = defaultDeliveryType; }
    public String getEffectiveDeliveryType() { return effectiveDeliveryType; }
    public void setEffectiveDeliveryType(String effectiveDeliveryType) { this.effectiveDeliveryType = effectiveDeliveryType; }
    public String getUserSelectedDeliveryType() { return userSelectedDeliveryType; }
    public void setUserSelectedDeliveryType(String userSelectedDeliveryType) { this.userSelectedDeliveryType = userSelectedDeliveryType; }
}
