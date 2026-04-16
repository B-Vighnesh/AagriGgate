package com.MyWebpage.register.login.notification.dto.response;

public class NotificationCategoryResponse {

    private String categoryName;
    private String description;
    private String defaultDeliveryType;
    private String defaultSeverity;
    private Boolean locationBased;
    private Boolean priceBased;
    private Boolean userSpecific;

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDefaultDeliveryType() { return defaultDeliveryType; }
    public void setDefaultDeliveryType(String defaultDeliveryType) { this.defaultDeliveryType = defaultDeliveryType; }
    public String getDefaultSeverity() { return defaultSeverity; }
    public void setDefaultSeverity(String defaultSeverity) { this.defaultSeverity = defaultSeverity; }
    public Boolean getLocationBased() { return locationBased; }
    public void setLocationBased(Boolean locationBased) { this.locationBased = locationBased; }
    public Boolean getPriceBased() { return priceBased; }
    public void setPriceBased(Boolean priceBased) { this.priceBased = priceBased; }
    public Boolean getUserSpecific() { return userSpecific; }
    public void setUserSpecific(Boolean userSpecific) { this.userSpecific = userSpecific; }
}
