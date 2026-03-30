package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.entity.UserNotificationPreference;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import com.MyWebpage.register.login.notification.mapper.NotificationPreferenceMapper;
import com.MyWebpage.register.login.notification.repository.UserNotificationPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    private final UserNotificationPreferenceRepository preferenceRepository;
    private final NotificationPreferenceMapper preferenceMapper;

    public NotificationPreferenceServiceImpl(
            UserNotificationPreferenceRepository preferenceRepository,
            NotificationPreferenceMapper preferenceMapper
    ) {
        this.preferenceRepository = preferenceRepository;
        this.preferenceMapper = preferenceMapper;
    }

    @Override
    public boolean isTypeEnabled(Long userId, NotificationType type) {
        if (type == NotificationType.ADMIN_MESSAGE) {
            return true;
        }
        return preferenceRepository.findByUserIdAndNotificationType(userId, type)
                .map(UserNotificationPreference::getEnabled)
                .orElse(true);
    }

    @Override
    public List<NotificationPreferenceResponse> getPreferences(Long userId) {
        Map<NotificationType, UserNotificationPreference> storedByType = new EnumMap<>(NotificationType.class);
        for (UserNotificationPreference preference : preferenceRepository.findByUserId(userId)) {
            storedByType.put(preference.getNotificationType(), preference);
        }

        return java.util.Arrays.stream(NotificationType.values())
                .map(type -> {
                    UserNotificationPreference stored = storedByType.get(type);
                    NotificationPreferenceResponse response = stored != null
                            ? preferenceMapper.toResponse(stored)
                            : preferenceMapper.toDefaultResponse(type);
                    if (type == NotificationType.ADMIN_MESSAGE) {
                        response.setEnabled(true);
                    }
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse setPreference(Long userId, NotificationType type, boolean enabled) {
        if (type == NotificationType.ADMIN_MESSAGE && !enabled) {
            throw new IllegalArgumentException("Admin messages cannot be disabled");
        }

        UserNotificationPreference preference = preferenceRepository.findByUserIdAndNotificationType(userId, type)
                .orElseGet(() -> {
                    UserNotificationPreference created = new UserNotificationPreference();
                    created.setUserId(userId);
                    created.setNotificationType(type);
                    return created;
                });

        preference.setEnabled(enabled || type == NotificationType.ADMIN_MESSAGE);
        UserNotificationPreference saved = preferenceRepository.save(preference);
        return preferenceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void resetToDefaults(Long userId) {
        preferenceRepository.deleteByUserId(userId);
    }
}
