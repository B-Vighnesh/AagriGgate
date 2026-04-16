package com.MyWebpage.register.login.notification.entity;

import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_category", indexes = {
        @Index(name = "idx_notification_category_name", columnList = "category_name", unique = true)
})
public class NotificationCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", nullable = false, length = 100, unique = true)
    private String categoryName;

    @Column(nullable = false, length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_delivery_type", nullable = false, length = 20)
    private MessageDeliveryType defaultDeliveryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_severity", nullable = false, length = 20)
    private MessageSeverity defaultSeverity;

    @Column(name = "is_location_based", nullable = false)
    private Boolean locationBased = false;

    @Column(name = "is_price_based", nullable = false)
    private Boolean priceBased = false;

    @Column(name = "is_user_specific", nullable = false)
    private Boolean userSpecific = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public MessageDeliveryType getDefaultDeliveryType() { return defaultDeliveryType; }
    public void setDefaultDeliveryType(MessageDeliveryType defaultDeliveryType) { this.defaultDeliveryType = defaultDeliveryType; }
    public MessageSeverity getDefaultSeverity() { return defaultSeverity; }
    public void setDefaultSeverity(MessageSeverity defaultSeverity) { this.defaultSeverity = defaultSeverity; }
    public Boolean getLocationBased() { return locationBased; }
    public void setLocationBased(Boolean locationBased) { this.locationBased = locationBased; }
    public Boolean getPriceBased() { return priceBased; }
    public void setPriceBased(Boolean priceBased) { this.priceBased = priceBased; }
    public Boolean getUserSpecific() { return userSpecific; }
    public void setUserSpecific(Boolean userSpecific) { this.userSpecific = userSpecific; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
