package com.MyWebpage.register.login.notification.entity;

import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_category_preference", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_category_preference", columnNames = {"user_id", "category_id"})
}, indexes = {
        @Index(name = "idx_user_category_preference_user_id", columnList = "user_id")
})
public class UserCategoryPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 20)
    private MessageDeliveryType deliveryType;

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
    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }
    public MessageDeliveryType getDeliveryType() { return deliveryType; }
    public void setDeliveryType(MessageDeliveryType deliveryType) { this.deliveryType = deliveryType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
