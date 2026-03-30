package com.MyWebpage.register.login.notification.mapper;

import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.entity.Notification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class NotificationMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    public NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setBody(notification.getBody());
        response.setType(notification.getType().name());
        response.setStatus(notification.getStatus().name());
        response.setReferenceId(notification.getReferenceId());
        response.setReferenceType(notification.getReferenceType());
        response.setCreatedAt(format(notification.getCreatedAt()));
        return response;
    }

    private String format(LocalDateTime value) {
        return value == null ? null : value.format(FORMATTER);
    }
}
