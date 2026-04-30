package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationCategoryResponse;
import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.event.NotificationEvent;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationService {

    void publishEvent(NotificationEvent event);

    Page<NotificationResponse> getNotificationsForUser(Long userId, MessageDeliveryType deliveryType, int page, int size);

    List<NotificationResponse> getActiveAlerts(Long userId);

    List<NotificationCategoryResponse> getCategories();

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    @Transactional
    void markAllAlertsAsRead(Long userId);

    void acknowledgeAlert(Long notificationId, Long userId);

    long countUnread(Long userId);
}
