package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.enums.NotificationStatus;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import org.springframework.data.domain.Page;

public interface NotificationService {

    void createNotification(Long userId, String title, String body, NotificationType type, String referenceId, String referenceType);

    Page<NotificationResponse> getNotificationsForUser(Long userId, NotificationStatus status, int page, int size);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    long countUnread(Long userId);
}
