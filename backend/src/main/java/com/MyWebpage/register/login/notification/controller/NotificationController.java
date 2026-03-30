package com.MyWebpage.register.login.notification.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.enums.NotificationStatus;
import com.MyWebpage.register.login.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestParam(defaultValue = "UNREAD") NotificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        Page<NotificationResponse> data = notificationService.getNotificationsForUser(userId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", data));
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

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "OK"));
    }
}
