package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.notification.dto.response.NotificationCategoryResponse;
import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.entity.NotificationCategory;
import com.MyWebpage.register.login.notification.entity.UserCategoryPreference;
import com.MyWebpage.register.login.notification.entity.UserMessage;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import com.MyWebpage.register.login.notification.event.NotificationEvent;
import com.MyWebpage.register.login.notification.repository.UserCategoryPreferenceRepository;
import com.MyWebpage.register.login.notification.repository.UserMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final NotificationCategoryService categoryService;
    private final NotificationTargetResolver targetResolver;
    private final NotificationRedirectService redirectService;
    private final UserCategoryPreferenceRepository preferenceRepository;
    private final UserMessageRepository userMessageRepository;

    public NotificationServiceImpl(
            NotificationCategoryService categoryService,
            NotificationTargetResolver targetResolver,
            NotificationRedirectService redirectService,
            UserCategoryPreferenceRepository preferenceRepository,
            UserMessageRepository userMessageRepository
    ) {
        this.categoryService = categoryService;
        this.targetResolver = targetResolver;
        this.redirectService = redirectService;
        this.preferenceRepository = preferenceRepository;
        this.userMessageRepository = userMessageRepository;
    }

    @Override
    @Transactional
    public void publishEvent(NotificationEvent event) {
        validateEvent(event);

        NotificationCategory category = categoryService.resolveCategory(event.getCategoryName(), event.getSeverity());
        Set<Long> targetUsers = targetResolver.resolveTargetUsers(event.getTarget().getType(), event.getTarget().getValue());
        if (targetUsers.isEmpty()) {
            return;
        }

        List<UserMessage> messages = new ArrayList<>();
        for (Long userId : targetUsers) {
            MessageDeliveryType resolvedDeliveryType = resolveDeliveryType(userId, category);
            if (resolvedDeliveryType == MessageDeliveryType.OFF) {
                continue;
            }

            UserMessage message = new UserMessage();
            message.setUserId(userId);
            message.setTitle(event.getTitle().trim());
            message.setMessageText(event.getMessage().trim());
            message.setDeliveryType(resolvedDeliveryType);
            message.setCategory(category);
            message.setSeverity(event.getSeverity() == null ? category.getDefaultSeverity() : event.getSeverity());
            message.setTargetType(event.getTarget().getType());
            if (event.getReference() != null) {
                message.setReferenceType(event.getReference().getType());
                message.setReferenceId(event.getReference().getId());
            }
            populateLocationData(message, event);
            if (resolvedDeliveryType == MessageDeliveryType.ALERT) {
                message.setRepeatIntervalMinutes(defaultRepeatInterval(message.getSeverity()));
                message.setExpiresAt(defaultExpiry(message.getSeverity(), event.getCreatedAt()));
            }
            messages.add(message);
        }
        userMessageRepository.saveAll(messages);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsForUser(Long userId, MessageDeliveryType deliveryType, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserMessage> messages = deliveryType == null
                ? userMessageRepository.findByUserId(userId, pageable)
                : userMessageRepository.findByUserIdAndDeliveryType(userId, deliveryType, pageable);
        return messages.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getActiveAlerts(Long userId) {
        List<UserMessage> alerts = new ArrayList<>();
        alerts.addAll(userMessageRepository.findByUserIdAndDeliveryTypeAndIsAcknowledgedFalseAndExpiresAtIsNullOrderByCreatedAtDesc(
                userId,
                MessageDeliveryType.ALERT
        ));
        alerts.addAll(userMessageRepository.findByUserIdAndDeliveryTypeAndIsAcknowledgedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                userId,
                MessageDeliveryType.ALERT,
                LocalDateTime.now()
        ));
        return alerts.stream().distinct().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationCategoryResponse> getCategories() {
        return categoryService.getAllCategories();
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        UserMessage message = userMessageRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        message.setIsRead(true);
        userMessageRepository.save(message);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserMessage> unreadNotifications = userMessageRepository.findByUserIdAndDeliveryTypeAndIsReadFalse(
                userId,
                MessageDeliveryType.NOTIFICATION
        );
        unreadNotifications.forEach(message -> message.setIsRead(true));
        userMessageRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void acknowledgeAlert(Long notificationId, Long userId) {
        UserMessage message = userMessageRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        message.setIsAcknowledged(true);
        userMessageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return userMessageRepository.countByUserIdAndDeliveryTypeAndIsReadFalse(userId, MessageDeliveryType.NOTIFICATION);
    }

    private void validateEvent(NotificationEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Notification event is required");
        }
        if (event.getCategoryName() == null || event.getCategoryName().isBlank()) {
            throw new IllegalArgumentException("categoryName is required");
        }
        if (event.getTitle() == null || event.getTitle().isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (event.getMessage() == null || event.getMessage().isBlank()) {
            throw new IllegalArgumentException("message is required");
        }
        if (event.getTarget() == null || event.getTarget().getType() == null) {
            throw new IllegalArgumentException("target.type is required");
        }
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }
        if (event.getSeverity() == null) {
            event.setSeverity(MessageSeverity.MEDIUM);
        }
        event.setCategoryName(event.getCategoryName().trim().toUpperCase());
    }

    private MessageDeliveryType resolveDeliveryType(Long userId, NotificationCategory category) {
        UserCategoryPreference preference = preferenceRepository
                .findByUserIdAndCategory_CategoryNameIgnoreCase(userId, category.getCategoryName())
                .orElse(null);
        return preference == null ? category.getDefaultDeliveryType() : preference.getDeliveryType();
    }

    private Integer defaultRepeatInterval(MessageSeverity severity) {
        return switch (severity) {
            case CRITICAL -> 5;
            case HIGH -> 15;
            case MEDIUM -> 30;
            case LOW -> 60;
        };
    }

    private LocalDateTime defaultExpiry(MessageSeverity severity, LocalDateTime createdAt) {
        LocalDateTime base = createdAt == null ? LocalDateTime.now() : createdAt;
//        return switch (severity) {
//            case CRITICAL -> base.plusDays(1);
//            case HIGH -> base.plusHours(12);
//            case MEDIUM -> base.plusHours(6);
//            case LOW -> base.plusHours(3);
//        };
        return null;
    }

    private void populateLocationData(UserMessage message, NotificationEvent event) {
        if (event.getTarget() == null || event.getTarget().getValue() == null) {
            return;
        }
        switch (event.getTarget().getType()) {
            case LOCATION -> message.setLocationDistrict(event.getTarget().getValue().trim());
            case STATE -> message.setLocationState(event.getTarget().getValue().trim());
            default -> {
            }
        }
    }

    private NotificationResponse toResponse(UserMessage message) {
        NotificationResponse response = new NotificationResponse();
        response.setId(message.getId());
        response.setTitle(message.getTitle());
        response.setMessage(message.getMessageText());
        response.setDeliveryType(message.getDeliveryType().name());
        response.setCategoryName(message.getCategory().getCategoryName());
        response.setSeverity(message.getSeverity().name());
        response.setIsRead(message.getIsRead());
        response.setIsAcknowledged(message.getIsAcknowledged());
        response.setRepeatIntervalMinutes(message.getRepeatIntervalMinutes());
        response.setExpiresAt(format(message.getExpiresAt()));
        response.setReferenceType(message.getReferenceType() == null ? null : message.getReferenceType().name());
        response.setReferenceId(message.getReferenceId());
        response.setTargetType(message.getTargetType() == null ? null : message.getTargetType().name());
        response.setLocationState(message.getLocationState());
        response.setLocationDistrict(message.getLocationDistrict());
        response.setRedirectUrl(redirectService.resolveRedirectUrl(message.getReferenceType(), message.getReferenceId()));
        response.setCreatedAt(format(message.getCreatedAt()));
        return response;
    }

    private String format(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(FORMATTER);
    }
}
