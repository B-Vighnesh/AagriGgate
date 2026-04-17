package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.enums.NotificationReferenceType;
import org.springframework.stereotype.Service;

@Service
public class NotificationRedirectService {

    public String resolveRedirectUrl(NotificationReferenceType referenceType, Long referenceId) {
        if (referenceType == null || referenceId == null) {
            return null;
        }
        return switch (referenceType) {
            case REQUEST -> "/requests/" + referenceId;
            case CROP -> "/crops/" + referenceId;
            case NEWS -> "/news/" + referenceId;
            case MARKET -> "/market/" + referenceId;
            case USER -> "/users/" + referenceId;
            case ADMIN -> "/announcements/" + referenceId;
            case WEATHER -> "/weather/" + referenceId;
            case AI -> "/ai/" + referenceId;
            case CHAT -> "/chat/" + referenceId;
        };
    }
}
