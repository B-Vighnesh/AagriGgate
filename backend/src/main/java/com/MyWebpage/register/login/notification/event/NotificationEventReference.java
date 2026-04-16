package com.MyWebpage.register.login.notification.event;

import com.MyWebpage.register.login.notification.enums.NotificationReferenceType;

public class NotificationEventReference {

    private NotificationReferenceType type;
    private Long id;

    public NotificationEventReference() {
    }

    public NotificationEventReference(NotificationReferenceType type, Long id) {
        this.type = type;
        this.id = id;
    }

    public NotificationReferenceType getType() {
        return type;
    }

    public void setType(NotificationReferenceType type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
