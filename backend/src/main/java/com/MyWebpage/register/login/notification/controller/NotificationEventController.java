package com.MyWebpage.register.login.notification.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.notification.dto.request.NotificationEventRequest;
import com.MyWebpage.register.login.notification.event.NotificationEvent;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import com.MyWebpage.register.login.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/notifications/events")
public class NotificationEventController {

    private final NotificationService notificationService;

    public NotificationEventController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> publishEvent(@Valid @RequestBody NotificationEventRequest request) {
        NotificationEvent event = new NotificationEvent();
        event.setEventType(request.getEventType().trim().toUpperCase(Locale.ROOT));
        event.setCategoryName(request.getCategoryName().trim().toUpperCase(Locale.ROOT));
        event.setSeverity(MessageSeverity.valueOf(request.getSeverity().trim().toUpperCase(Locale.ROOT)));
        event.setTitle(request.getTitle());
        event.setMessage(request.getMessage());
        event.setTarget(request.getTarget());
        event.setReference(request.getReference());
        event.setCreatedAt(LocalDateTime.now());
        notificationService.publishEvent(event);
        return ResponseEntity.ok(ApiResponse.success("Notification event processed", "OK"));
    }
}
