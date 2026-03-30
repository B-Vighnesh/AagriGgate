package com.MyWebpage.register.login.notification.repository;

import com.MyWebpage.register.login.notification.entity.UserNotificationPreference;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {

    Optional<UserNotificationPreference> findByUserIdAndNotificationType(Long userId, NotificationType type);

    List<UserNotificationPreference> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
