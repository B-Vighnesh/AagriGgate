package com.MyWebpage.register.login.notification.service;

import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.favorite.FavoriteRepo;
import com.MyWebpage.register.login.market.saved.SavedMarketRepository;
import com.MyWebpage.register.login.notification.enums.NotificationTargetType;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class NotificationTargetResolver {

    private final FarmerRepo farmerRepo;
    private final FavoriteRepo favoriteRepo;
    private final SavedMarketRepository savedMarketRepository;

    public NotificationTargetResolver(
            FarmerRepo farmerRepo,
            FavoriteRepo favoriteRepo,
            SavedMarketRepository savedMarketRepository
    ) {
        this.farmerRepo = farmerRepo;
        this.favoriteRepo = favoriteRepo;
        this.savedMarketRepository = savedMarketRepository;
    }

    public Set<Long> resolveTargetUsers(NotificationTargetType targetType, String targetValue) {
        if (targetType == null) {
            return Set.of();
        }

        List<Long> resolved = switch (targetType) {
            case USER -> targetValue == null || targetValue.isBlank() ? List.of() : List.of(Long.parseLong(targetValue.trim()));
            case LOCATION -> targetValue == null || targetValue.isBlank() ? List.of() : farmerRepo.findActiveUserIdsByDistrict(targetValue.trim());
            case STATE -> targetValue == null || targetValue.isBlank() ? List.of() : farmerRepo.findActiveUserIdsByState(targetValue.trim());
            case COUNTRY, ALL -> farmerRepo.findActiveUserIds();
            case CROP -> targetValue == null || targetValue.isBlank() ? List.of() : favoriteRepo.findDistinctBuyerIdsByCropName(targetValue.trim());
            case PRICE_RULE -> resolvePriceRuleUsers(targetValue);
        };

        return new LinkedHashSet<>(resolved);
    }

    private List<Long> resolvePriceRuleUsers(String targetValue) {
        if (targetValue == null || targetValue.isBlank()) {
            return List.of();
        }
        try {
            return savedMarketRepository.findDistinctUserIdsByMarketId(Long.parseLong(targetValue.trim()));
        } catch (NumberFormatException exception) {
            return List.of();
        }
    }
}
