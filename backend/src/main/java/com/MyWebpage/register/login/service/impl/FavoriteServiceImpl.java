package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.favorite.FavoriteItemDTO;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.crop.Crop;
import com.MyWebpage.register.login.farmer.Favorite;
import com.MyWebpage.register.login.crop.CropRepo;
import com.MyWebpage.register.login.favorite.FavoriteRepo;
import com.MyWebpage.register.login.service.FavoriteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepo favoriteRepo;
    private final CropRepo cropRepo;

    public FavoriteServiceImpl(FavoriteRepo favoriteRepo, CropRepo cropRepo) {
        this.favoriteRepo = favoriteRepo;
        this.cropRepo = cropRepo;
    }

    @Override
    public void addFavorite(Long buyerId, Long cropId) {
        if (favoriteRepo.existsByBuyerIdAndCropId(buyerId, cropId)) {
            return;
        }
        Crop crop = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found"));
        Long ownerId = crop.getFarmer() != null ? crop.getFarmer().getFarmerId() : null;
        if (buyerId.equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot favorite your own crop");
        }
        Favorite favorite = new Favorite();
        favorite.setBuyerId(buyerId);
        favorite.setCropId(cropId);
        favorite.setCreatedAt(LocalDateTime.now());
        favoriteRepo.save(favorite);
    }

    @Override
    public void removeFavorite(Long buyerId, Long cropId) {
        favoriteRepo.findByBuyerIdAndCropId(buyerId, cropId).ifPresent(favoriteRepo::delete);
    }

    @Override
    public boolean isFavorite(Long buyerId, Long cropId) {
        return favoriteRepo.existsByBuyerIdAndCropId(buyerId, cropId);
    }

    @Override
    public Page<FavoriteItemDTO> getFavorites(Long buyerId, String keyword, String type, String sortBy, int page, int size) {
        return favoriteRepo.findFavoriteViewsByBuyerId(
                buyerId,
                normalizeFilter(keyword),
                normalizeType(type),
                normalizeSort(sortBy),
                buildPageRequest(page, size)
        );
    }

    private PageRequest buildPageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        return PageRequest.of(safePage, safeSize, Sort.unsorted());
    }

    private String normalizeFilter(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeType(String value) {
        return value == null || value.isBlank() || "all".equalsIgnoreCase(value) ? null : value.trim().toLowerCase();
    }

    private String normalizeSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "newest";
        }
        return sortBy.trim().toLowerCase();
    }
}
