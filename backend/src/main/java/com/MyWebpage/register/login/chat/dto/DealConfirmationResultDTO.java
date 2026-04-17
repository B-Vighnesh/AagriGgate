package com.MyWebpage.register.login.chat.dto;

public class DealConfirmationResultDTO {
    private String message;
    private boolean completed;
    private Double agreedQuantity;
    private Double remainingQuantity;
    private String listingStatus;
    private ConversationSummaryDTO conversation;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Double getAgreedQuantity() {
        return agreedQuantity;
    }

    public void setAgreedQuantity(Double agreedQuantity) {
        this.agreedQuantity = agreedQuantity;
    }

    public Double getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Double remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public String getListingStatus() {
        return listingStatus;
    }

    public void setListingStatus(String listingStatus) {
        this.listingStatus = listingStatus;
    }

    public ConversationSummaryDTO getConversation() {
        return conversation;
    }

    public void setConversation(ConversationSummaryDTO conversation) {
        this.conversation = conversation;
    }
}
