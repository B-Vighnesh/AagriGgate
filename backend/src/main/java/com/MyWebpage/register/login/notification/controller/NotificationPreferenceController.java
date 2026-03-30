package com.MyWebpage.register.login.notification.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.notification.dto.request.NotificationPreferenceRequest;
import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import com.MyWebpage.register.login.notification.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/notifications/preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    public NotificationPreferenceController(NotificationPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationPreferenceResponse>>> getPreferences(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification preferences fetched", preferenceService.getPreferences(userId)));
    }

    @PatchMapping("/{type}")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> setPreference(
            @PathVariable String type,
            @Valid @RequestBody NotificationPreferenceRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        NotificationType notificationType = NotificationType.valueOf(type.trim().toUpperCase(Locale.ROOT));
        NotificationPreferenceResponse response = preferenceService.setPreference(userId, notificationType, request.getEnabled());
        return ResponseEntity.ok(ApiResponse.success("Notification preference updated", response));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetToDefaults(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        preferenceService.resetToDefaults(userId);
        return ResponseEntity.ok(ApiResponse.success("Notification preferences reset to defaults", "OK"));
    }
}
