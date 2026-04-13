package com.MyWebpage.register.login.chat;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conversationId;

    @Column(nullable = false, unique = true)
    private Long approachId;

    @Column(nullable = false)
    private Long buyerId;

    @Column(nullable = false)
    private String buyerName;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false)
    private String farmerName;

    @Column(nullable = false)
    private Long listingId;

    @Column(nullable = false)
    private String listingName;

    @Column(nullable = false)
    private Double requestedQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status = ConversationStatus.ACTIVE;

    @Column(nullable = false)
    private Boolean active = true;

    private Double pendingDealQuantity;

    @Column(nullable = false)
    private Boolean buyerDealConfirmed = false;

    @Column(nullable = false)
    private Boolean farmerDealConfirmed = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime lastMessageAt;
    private LocalDateTime completedAt;
    private LocalDateTime failedAt;
    private LocalDateTime expiredAt;
    private LocalDateTime buyerArchivedAt;
    private LocalDateTime farmerArchivedAt;
    private LocalDateTime buyerDeletedAt;
    private LocalDateTime farmerDeletedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (lastMessageAt == null) {
            lastMessageAt = now;
        }
        if (status == null) {
            status = ConversationStatus.ACTIVE;
        }
        if (active == null) {
            active = true;
        }
        if (buyerDealConfirmed == null) {
            buyerDealConfirmed = false;
        }
        if (farmerDealConfirmed == null) {
            farmerDealConfirmed = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getApproachId() {
        return approachId;
    }

    public void setApproachId(Long approachId) {
        this.approachId = approachId;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
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

    public Long getListingId() {
        return listingId;
    }

    public void setListingId(Long listingId) {
        this.listingId = listingId;
    }

    public String getListingName() {
        return listingName;
    }

    public void setListingName(String listingName) {
        this.listingName = listingName;
    }

    public Double getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Double requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public ConversationStatus getStatus() {
        return status;
    }

    public void setStatus(ConversationStatus status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Double getPendingDealQuantity() {
        return pendingDealQuantity;
    }

    public void setPendingDealQuantity(Double pendingDealQuantity) {
        this.pendingDealQuantity = pendingDealQuantity;
    }

    public Boolean getBuyerDealConfirmed() {
        return buyerDealConfirmed;
    }

    public void setBuyerDealConfirmed(Boolean buyerDealConfirmed) {
        this.buyerDealConfirmed = buyerDealConfirmed;
    }

    public Boolean getFarmerDealConfirmed() {
        return farmerDealConfirmed;
    }

    public void setFarmerDealConfirmed(Boolean farmerDealConfirmed) {
        this.farmerDealConfirmed = farmerDealConfirmed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
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

    public LocalDateTime getBuyerArchivedAt() {
        return buyerArchivedAt;
    }

    public void setBuyerArchivedAt(LocalDateTime buyerArchivedAt) {
        this.buyerArchivedAt = buyerArchivedAt;
    }

    public LocalDateTime getFarmerArchivedAt() {
        return farmerArchivedAt;
    }

    public void setFarmerArchivedAt(LocalDateTime farmerArchivedAt) {
        this.farmerArchivedAt = farmerArchivedAt;
    }

    public LocalDateTime getBuyerDeletedAt() {
        return buyerDeletedAt;
    }

    public void setBuyerDeletedAt(LocalDateTime buyerDeletedAt) {
        this.buyerDeletedAt = buyerDeletedAt;
    }

    public LocalDateTime getFarmerDeletedAt() {
        return farmerDeletedAt;
    }

    public void setFarmerDeletedAt(LocalDateTime farmerDeletedAt) {
        this.farmerDeletedAt = farmerDeletedAt;
    }
}
