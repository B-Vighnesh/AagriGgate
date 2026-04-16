package com.MyWebpage.register.login.notification.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.notification.dto.response.NotificationCategoryResponse;
import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) MessageDeliveryType deliveryType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notificationService.getNotificationsForUser(userId, deliveryType, page, size)));
    }

    @GetMapping("/alerts/active")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getActiveAlerts(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Active alerts fetched", notificationService.getActiveAlerts(userId)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<NotificationCategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Notification categories fetched", notificationService.getCategories()));
    }

    @GetMapping("/count-unread")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUnread(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("count", notificationService.countUnread(userId))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "OK"));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<String>> acknowledgeAlert(@PathVariable Long id, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.acknowledgeAlert(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", "OK"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "OK"));
    }
}
