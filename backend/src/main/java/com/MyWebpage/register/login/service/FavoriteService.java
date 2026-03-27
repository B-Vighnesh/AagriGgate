package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.FavoriteItemDTO;
import org.springframework.data.domain.Page;

public interface FavoriteService {
    void addFavorite(Long buyerId, Long cropId);
    void removeFavorite(Long buyerId, Long cropId);
    boolean isFavorite(Long buyerId, Long cropId);
    Page<FavoriteItemDTO> getFavorites(Long buyerId, String keyword, String type, String sortBy, int page, int size);
}
