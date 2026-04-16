package com.MyWebpage.register.login.notification.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.notification.dto.request.NotificationPreferenceRequest;
import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{categoryName}")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> setPreference(
            @PathVariable String categoryName,
            @Valid @RequestBody NotificationPreferenceRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        MessageDeliveryType deliveryType = MessageDeliveryType.valueOf(request.getDeliveryType().trim().toUpperCase(Locale.ROOT));
        NotificationPreferenceResponse response = preferenceService.setPreference(userId, categoryName, deliveryType);
        return ResponseEntity.ok(ApiResponse.success("Notification preference updated", response));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetToDefaults(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        preferenceService.resetToDefaults(userId);
        return ResponseEntity.ok(ApiResponse.success("Notification preferences reset to defaults", "OK"));
    }
}
