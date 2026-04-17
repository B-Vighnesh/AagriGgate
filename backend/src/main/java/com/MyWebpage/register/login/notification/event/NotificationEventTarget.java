package com.MyWebpage.register.login.notification.event;

import com.MyWebpage.register.login.notification.enums.NotificationTargetType;

public class NotificationEventTarget {

    private NotificationTargetType type;
    private String value;

    public NotificationEventTarget() {
    }

    public NotificationEventTarget(NotificationTargetType type, String value) {
        this.type = type;
        this.value = value;
    }

    public NotificationTargetType getType() {
        return type;
    }

    public void setType(NotificationTargetType type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
