package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.enums.NotificationType;

import java.util.List;

public interface NotificationPreferenceService {

    boolean isTypeEnabled(Long userId, NotificationType type);

    List<NotificationPreferenceResponse> getPreferences(Long userId);

    NotificationPreferenceResponse setPreference(Long userId, NotificationType type, boolean enabled);

    void resetToDefaults(Long userId);
}
