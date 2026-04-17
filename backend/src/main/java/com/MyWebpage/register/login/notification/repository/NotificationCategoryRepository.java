package com.MyWebpage.register.login.notification.repository;

import com.MyWebpage.register.login.notification.entity.NotificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationCategoryRepository extends JpaRepository<NotificationCategory, Long> {

    Optional<NotificationCategory> findByCategoryNameIgnoreCase(String categoryName);
}
