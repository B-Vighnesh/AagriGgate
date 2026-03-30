package com.MyWebpage.register.login.notification.mapper;

import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.entity.UserNotificationPreference;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class NotificationPreferenceMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    public NotificationPreferenceResponse toResponse(UserNotificationPreference pref) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setNotificationType(pref.getNotificationType().name());
        response.setEnabled(pref.getEnabled());
        response.setUpdatedAt(format(pref.getUpdatedAt()));
        return response;
    }

    public NotificationPreferenceResponse toDefaultResponse(NotificationType type) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setNotificationType(type.name());
        response.setEnabled(true);
        response.setUpdatedAt(null);
        return response;
    }

    private String format(LocalDateTime value) {
        return value == null ? null : value.format(FORMATTER);
    }
}
