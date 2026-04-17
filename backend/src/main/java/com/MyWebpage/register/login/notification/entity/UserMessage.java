package com.MyWebpage.register.login.notification.entity;

import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import com.MyWebpage.register.login.notification.enums.NotificationReferenceType;
import com.MyWebpage.register.login.notification.enums.NotificationTargetType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_message", indexes = {
        @Index(name = "idx_user_message_user_delivery_created", columnList = "user_id,delivery_type,created_at"),
        @Index(name = "idx_user_message_user_read", columnList = "user_id,is_read"),
        @Index(name = "idx_user_message_user_ack", columnList = "user_id,is_acknowledged")
})
public class UserMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "message_text", nullable = false, length = 2000)
    private String messageText;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 20)
    private MessageDeliveryType deliveryType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 20)
    private NotificationReferenceType referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private NotificationTargetType targetType;

    @Column(name = "location_state", length = 120)
    private String locationState;

    @Column(name = "location_district", length = 160)
    private String locationDistrict;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageSeverity severity;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "is_acknowledged", nullable = false)
    private Boolean isAcknowledged = false;

    @Column(name = "repeat_interval_minutes")
    private Integer repeatIntervalMinutes;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public MessageDeliveryType getDeliveryType() { return deliveryType; }
    public void setDeliveryType(MessageDeliveryType deliveryType) { this.deliveryType = deliveryType; }
    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }
    public NotificationReferenceType getReferenceType() { return referenceType; }
    public void setReferenceType(NotificationReferenceType referenceType) { this.referenceType = referenceType; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public NotificationTargetType getTargetType() { return targetType; }
    public void setTargetType(NotificationTargetType targetType) { this.targetType = targetType; }
    public String getLocationState() { return locationState; }
    public void setLocationState(String locationState) { this.locationState = locationState; }
    public String getLocationDistrict() { return locationDistrict; }
    public void setLocationDistrict(String locationDistrict) { this.locationDistrict = locationDistrict; }
    public MessageSeverity getSeverity() { return severity; }
    public void setSeverity(MessageSeverity severity) { this.severity = severity; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
    public Boolean getIsAcknowledged() { return isAcknowledged; }
    public void setIsAcknowledged(Boolean acknowledged) { isAcknowledged = acknowledged; }
    public Integer getRepeatIntervalMinutes() { return repeatIntervalMinutes; }
    public void setRepeatIntervalMinutes(Integer repeatIntervalMinutes) { this.repeatIntervalMinutes = repeatIntervalMinutes; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
