package com.MyWebpage.register.login.notification.dto.request;

import jakarta.validation.constraints.NotBlank;

public class NotificationPreferenceRequest {

    @NotBlank
    private String deliveryType;

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }
}
