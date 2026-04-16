package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.notification.dto.response.NotificationCategoryResponse;
import com.MyWebpage.register.login.notification.entity.NotificationCategory;
import com.MyWebpage.register.login.notification.enums.MessageDeliveryType;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import com.MyWebpage.register.login.notification.repository.NotificationCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationCategoryService {

    private final NotificationCategoryRepository categoryRepository;

    public NotificationCategoryService(NotificationCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public NotificationCategory resolveCategory(String categoryName, MessageSeverity eventSeverity) {
        return categoryRepository.findByCategoryNameIgnoreCase(categoryName)
                .orElseGet(() -> createFallbackCategory(categoryName, eventSeverity));
    }

    public List<NotificationCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .sorted(java.util.Comparator.comparing(NotificationCategoryResponse::getCategoryName))
                .toList();
    }

    private NotificationCategory createFallbackCategory(String categoryName, MessageSeverity eventSeverity) {
        NotificationCategory category = new NotificationCategory();
        category.setCategoryName(categoryName.trim().toUpperCase());
        category.setDescription("Auto-registered category for " + categoryName.trim().toUpperCase());
        category.setDefaultSeverity(eventSeverity == null ? MessageSeverity.MEDIUM : eventSeverity);
        category.setDefaultDeliveryType(defaultDeliveryFor(eventSeverity));
        return categoryRepository.save(category);
    }

    private MessageDeliveryType defaultDeliveryFor(MessageSeverity severity) {
        if (severity == MessageSeverity.HIGH || severity == MessageSeverity.CRITICAL) {
            return MessageDeliveryType.ALERT;
        }
        return MessageDeliveryType.NOTIFICATION;
    }

    private NotificationCategoryResponse toResponse(NotificationCategory category) {
        NotificationCategoryResponse response = new NotificationCategoryResponse();
        response.setCategoryName(category.getCategoryName());
        response.setDescription(category.getDescription());
        response.setDefaultDeliveryType(category.getDefaultDeliveryType().name());
        response.setDefaultSeverity(category.getDefaultSeverity().name());
        response.setLocationBased(category.getLocationBased());
        response.setPriceBased(category.getPriceBased());
        response.setUserSpecific(category.getUserSpecific());
        return response;
    }
}
