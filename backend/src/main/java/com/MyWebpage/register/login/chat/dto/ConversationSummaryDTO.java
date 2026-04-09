package com.MyWebpage.register.login.chat.dto;

import java.time.LocalDateTime;

public class ConversationSummaryDTO {
    private Long conversationId;
    private Long approachId;
    private Long buyerId;
    private String buyerName;
    private Long farmerId;
    private String farmerName;
    private Long listingId;
    private String listingName;
    private Double requestedQuantity;
    private Double pendingDealQuantity;
    private Boolean buyerDealConfirmed;
    private Boolean farmerDealConfirmed;
    private String status;
    private Boolean active;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
