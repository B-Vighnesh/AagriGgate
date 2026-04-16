package com.MyWebpage.register.login.notification.repository;

import com.MyWebpage.register.login.notification.entity.UserMessage;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserMessageRepository extends JpaRepository<UserMessage, Long> {

    Page<UserMessage> findByUserId(Long userId, Pageable pageable);

    Page<UserMessage> findByUserIdAndDeliveryType(Long userId, MessageDeliveryType deliveryType, Pageable pageable);

    Optional<UserMessage> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndDeliveryTypeAndIsReadFalse(Long userId, MessageDeliveryType deliveryType);

    List<UserMessage> findByUserIdAndDeliveryTypeAndIsAcknowledgedFalseAndExpiresAtAfterOrderByCreatedAtDesc(Long userId, MessageDeliveryType deliveryType, LocalDateTime expiresAt);

    List<UserMessage> findByUserIdAndDeliveryTypeAndIsAcknowledgedFalseAndExpiresAtIsNullOrderByCreatedAtDesc(Long userId, MessageDeliveryType deliveryType);

    List<UserMessage> findByUserIdAndDeliveryTypeAndIsReadFalse(Long userId, MessageDeliveryType deliveryType);

    void deleteByUserId(Long userId);
}
