package com.MyWebpage.register.login.notification.event;

import com.MyWebpage.register.login.notification.enums.MessageSeverity;

import java.time.LocalDateTime;

public class NotificationEvent {

    private String eventType;
    private String categoryName;
    private MessageSeverity severity;
    private String title;
    private String message;
    private NotificationEventTarget target;
    private NotificationEventReference reference;
    private LocalDateTime createdAt;

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public MessageSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(MessageSeverity severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationEventTarget getTarget() {
        return target;
    }

    public void setTarget(NotificationEventTarget target) {
        this.target = target;
    }

    public NotificationEventReference getReference() {
        return reference;
    }

    public void setReference(NotificationEventReference reference) {
        this.reference = reference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
