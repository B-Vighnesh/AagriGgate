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
            validateAlertLimit(userId, categoryName, deliveryType);
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
    public List<NotificationPreferenceResponse> setAllToNotifications(Long userId) {
        return applyBulkPreferenceUpdate(userId, category -> MessageDeliveryType.NOTIFICATION);
    }

    @Override
    @Transactional
    public List<NotificationPreferenceResponse> turnAlertsOff(Long userId) {
        return applyBulkPreferenceUpdate(userId, category -> {
            MessageDeliveryType effectiveCurrent = resolveEffectiveDeliveryType(userId, category);
            return effectiveCurrent == MessageDeliveryType.ALERT
                    ? MessageDeliveryType.NOTIFICATION
                    : effectiveCurrent;
        });
    }

    @Override
    @Transactional
    public List<NotificationPreferenceResponse> turnAllOff(Long userId) {
        return applyBulkPreferenceUpdate(userId, category -> MessageDeliveryType.OFF);
    }

    private void validateAlertLimit(Long userId,
                                    String categoryName,
                                    MessageDeliveryType newDeliveryType) {

        // Only validate when trying to set ALERT
        if (newDeliveryType != MessageDeliveryType.ALERT) {
            return;
        }

        // 1. Load user preferences → Map
        Map<String, UserCategoryPreference> storedByCategory =
                preferenceRepository.findByUserId(userId).stream()
                        .collect(Collectors.toMap(
                                pref -> pref.getCategory().getCategoryName(),
                                Function.identity()
                        ));

        // 2. Count effective ALERT values (simulate new change)
        long alertCount = categoryRepository.findAll().stream()
                .map(category -> {

                    String currentCategoryName = category.getCategoryName();

                    // simulate the update for THIS category
                    if (currentCategoryName.equalsIgnoreCase(categoryName)) {
                        return newDeliveryType;
                    }

                    // existing preference or default
                    UserCategoryPreference pref = storedByCategory.get(currentCategoryName);

                    return (pref != null)
                            ? pref.getDeliveryType()
                            : category.getDefaultDeliveryType();
                })
                .filter(type -> type == MessageDeliveryType.ALERT)
                .count();

        // 3. Validate
        if (alertCount > MAX_ALERT_CATEGORY_SELECTIONS) {
            throw new IllegalArgumentException(
                    "You can set at most " + MAX_ALERT_CATEGORY_SELECTIONS + " categories as ALERT."
            );
        }
    }

    @Override
    @Transactional
    public void resetToDefaults(Long userId) {
        preferenceRepository.deleteByUserId(userId);
    }

    private List<NotificationPreferenceResponse> applyBulkPreferenceUpdate(
            Long userId,
            Function<NotificationCategory, MessageDeliveryType> deliveryTypeResolver
    ) {
        Map<String, UserCategoryPreference> existingByCategory = preferenceRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(pref -> pref.getCategory().getCategoryName(), Function.identity()));

        List<NotificationCategory> categories = categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(NotificationCategory::getCategoryName))
                .toList();

        List<UserCategoryPreference> preferencesToSave = categories.stream()
                .map(category -> {
                    MessageDeliveryType nextType = deliveryTypeResolver.apply(category);
                    UserCategoryPreference preference = existingByCategory.get(category.getCategoryName());
                    if (preference == null) {
                        preference = new UserCategoryPreference();
                        preference.setUserId(userId);
                        preference.setCategory(category);
                    }
                    preference.setDeliveryType(nextType);
                    return preference;
                })
                .toList();

        List<UserCategoryPreference> saved = preferenceRepository.saveAll(preferencesToSave);
        Map<String, UserCategoryPreference> savedByCategory = saved.stream()
                .collect(Collectors.toMap(pref -> pref.getCategory().getCategoryName(), Function.identity()));

        return categories.stream()
                .map(category -> toResponse(category, savedByCategory.get(category.getCategoryName())))
                .toList();
    }

    private MessageDeliveryType resolveEffectiveDeliveryType(Long userId, NotificationCategory category) {
        return preferenceRepository.findByUserIdAndCategory_CategoryNameIgnoreCase(userId, category.getCategoryName())
                .map(UserCategoryPreference::getDeliveryType)
                .orElse(category.getDefaultDeliveryType());
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
