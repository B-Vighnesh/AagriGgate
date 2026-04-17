package com.MyWebpage.register.login.notification.dto.request;

import com.MyWebpage.register.login.notification.event.NotificationEventReference;
import com.MyWebpage.register.login.notification.event.NotificationEventTarget;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class NotificationEventRequest {

    @NotBlank
    private String eventType;

    @NotBlank
    private String categoryName;

    @NotBlank
    private String severity;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @Valid
    private NotificationEventTarget target;

    @Valid
    private NotificationEventReference reference;

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationEventTarget getTarget() { return target; }
    public void setTarget(NotificationEventTarget target) { this.target = target; }
    public NotificationEventReference getReference() { return reference; }
    public void setReference(NotificationEventReference reference) { this.reference = reference; }
}
