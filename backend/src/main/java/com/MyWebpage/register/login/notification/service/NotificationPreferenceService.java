package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;

import java.util.List;

public interface NotificationPreferenceService {

    List<NotificationPreferenceResponse> getPreferences(Long userId);

    NotificationPreferenceResponse setPreference(Long userId, String categoryName, MessageDeliveryType deliveryType);

    List<NotificationPreferenceResponse> setAllToNotifications(Long userId);

    List<NotificationPreferenceResponse> turnAlertsOff(Long userId);

    List<NotificationPreferenceResponse> turnAllOff(Long userId);

    void resetToDefaults(Long userId);
}
