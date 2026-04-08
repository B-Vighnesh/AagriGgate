package com.MyWebpage.register.login.notification.repository;

import com.MyWebpage.register.login.notification.entity.Notification;
import com.MyWebpage.register.login.notification.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable);

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndStatus(Long userId, NotificationStatus status);

    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    long deleteByUserId(Long userId);
}
