package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.notification.dto.response.NotificationResponse;
import com.MyWebpage.register.login.notification.entity.Notification;
import com.MyWebpage.register.login.notification.enums.NotificationStatus;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import com.MyWebpage.register.login.notification.mapper.NotificationMapper;
import com.MyWebpage.register.login.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationPreferenceService preferenceService;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            NotificationMapper notificationMapper,
            NotificationPreferenceService preferenceService
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
        this.preferenceService = preferenceService;
    }

    @Override
    @Transactional
    public void createNotification(
            Long userId,
            String title,
            String body,
            NotificationType type,
            String referenceId,
            String referenceType
    ) {
        if (type != NotificationType.ADMIN_MESSAGE && !preferenceService.isTypeEnabled(userId, type)) {
            log.debug("[Notification] Skipped: userId={} type={} (disabled by preference)", userId, type);
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setType(type);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsForUser(Long userId, NotificationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = status == null
                ? notificationRepository.findByUserId(userId, pageable)
                : notificationRepository.findByUserIdAndStatus(userId, status, pageable);
        return notifications.map(notificationMapper::toResponse);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found with ID: " + notificationId);
        }
        notification.setStatus(NotificationStatus.READ);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        java.util.List<Notification> unread = notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.UNREAD);
        for (Notification notification : unread) {
            notification.setStatus(NotificationStatus.READ);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }
}
