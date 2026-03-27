package com.MyWebpage.register.login.dto;

import java.util.List;

public class CartCheckoutResponseDTO {
    private int successCount;
    private int failureCount;
    private List<String> messages;

    public CartCheckoutResponseDTO() {
    }

    public CartCheckoutResponseDTO(int successCount, int failureCount, List<String> messages) {
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.messages = messages;
    }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
    public List<String> getMessages() { return messages; }
    public void setMessages(List<String> messages) { this.messages = messages; }
}
