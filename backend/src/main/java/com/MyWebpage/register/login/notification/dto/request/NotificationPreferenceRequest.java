package com.MyWebpage.register.login.notification.dto.request;

import jakarta.validation.constraints.NotNull;

public class NotificationPreferenceRequest {

    @NotNull
    private Boolean enabled;

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
