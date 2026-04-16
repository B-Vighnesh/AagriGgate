package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationPreferenceResponse;
import com.MyWebpage.register.login.notification.entity.NotificationCategory;
import com.MyWebpage.register.login.notification.entity.UserCategoryPreference;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.repository.NotificationCategoryRepository;
import com.MyWebpage.register.login.notification.repository.UserCategoryPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    private static final long MAX_ALERT_CATEGORY_SELECTIONS = 5;

    private final NotificationCategoryRepository categoryRepository;
    private final UserCategoryPreferenceRepository preferenceRepository;

    public NotificationPreferenceServiceImpl(
            NotificationCategoryRepository categoryRepository,
            UserCategoryPreferenceRepository preferenceRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.preferenceRepository = preferenceRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponse> getPreferences(Long userId) {
        Map<String, UserCategoryPreference> storedByCategory = preferenceRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(pref -> pref.getCategory().getCategoryName(), Function.identity()));

        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(NotificationCategory::getCategoryName))
                .map(category -> toResponse(category, storedByCategory.get(category.getCategoryName())))
                .toList();
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse setPreference(Long userId, String categoryName, MessageDeliveryType deliveryType) {
        NotificationCategory category = categoryRepository.findByCategoryNameIgnoreCase(categoryName)
                .orElseThrow(() -> new IllegalArgumentException("Notification category not found: " + categoryName));

        UserCategoryPreference existing = preferenceRepository
                .findByUserIdAndCategory_CategoryNameIgnoreCase(userId, category.getCategoryName())
                .orElse(null);

        if (deliveryType == MessageDeliveryType.ALERT && (existing == null || existing.getDeliveryType() != MessageDeliveryType.ALERT)) {
            long alertCount = preferenceRepository.countByUserIdAndDeliveryType(userId, MessageDeliveryType.ALERT);
            if (alertCount >= MAX_ALERT_CATEGORY_SELECTIONS) {
                throw new IllegalArgumentException("You can set at most 5 categories as ALERT.");
            }
        }

        if (existing == null) {
            existing = new UserCategoryPreference();
            existing.setUserId(userId);
            existing.setCategory(category);
        }
        existing.setDeliveryType(deliveryType);
        UserCategoryPreference saved = preferenceRepository.save(existing);
        return toResponse(category, saved);
    }

    @Override
    @Transactional
    public void resetToDefaults(Long userId) {
        preferenceRepository.deleteByUserId(userId);
    }

    private NotificationPreferenceResponse toResponse(NotificationCategory category, UserCategoryPreference preference) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setCategoryName(category.getCategoryName());
        response.setDescription(category.getDescription());
        response.setDefaultDeliveryType(category.getDefaultDeliveryType().name());
        response.setEffectiveDeliveryType(preference == null ? category.getDefaultDeliveryType().name() : preference.getDeliveryType().name());
        response.setUserSelectedDeliveryType(preference == null ? null : preference.getDeliveryType().name());
        return response;
    }
}
