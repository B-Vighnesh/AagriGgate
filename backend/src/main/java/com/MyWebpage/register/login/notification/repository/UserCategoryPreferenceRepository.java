package com.MyWebpage.register.login.notification.repository;

import com.MyWebpage.register.login.notification.entity.UserCategoryPreference;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCategoryPreferenceRepository extends JpaRepository<UserCategoryPreference, Long> {

    Optional<UserCategoryPreference> findByUserIdAndCategory_CategoryNameIgnoreCase(Long userId, String categoryName);

    List<UserCategoryPreference> findByUserId(Long userId);

    long countByUserIdAndDeliveryType(Long userId, MessageDeliveryType deliveryType);

    void deleteByUserId(Long userId);
}
