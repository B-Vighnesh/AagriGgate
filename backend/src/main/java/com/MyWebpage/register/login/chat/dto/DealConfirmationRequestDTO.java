package com.MyWebpage.register.login.chat.dto;

public class DealConfirmationRequestDTO {
    private boolean useRequestedQuantity = true;
    private Double quantity;

    public boolean isUseRequestedQuantity() {
        return useRequestedQuantity;
    }

    public void setUseRequestedQuantity(boolean useRequestedQuantity) {
        this.useRequestedQuantity = useRequestedQuantity;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }
}
