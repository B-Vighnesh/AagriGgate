package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.FavoriteItemDTO;
import com.MyWebpage.register.login.service.FavoriteService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/crops/{cropId}/favorite")
    public ResponseEntity<Void> addFavorite(@PathVariable Long cropId, Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        favoriteService.addFavorite(buyerId, cropId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/crops/{cropId}/favorite")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long cropId, Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        favoriteService.removeFavorite(buyerId, cropId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/crops/{cropId}/favorite")
    public ResponseEntity<Boolean> isFavorite(@PathVariable Long cropId, Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(favoriteService.isFavorite(buyerId, cropId));
    }

    @GetMapping("/users/favorites")
    public ResponseEntity<Page<FavoriteItemDTO>> getFavorites(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long buyerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(favoriteService.getFavorites(buyerId, keyword, type, sortBy, page, size));
    }
}
