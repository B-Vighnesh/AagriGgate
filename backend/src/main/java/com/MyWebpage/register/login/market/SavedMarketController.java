package com.MyWebpage.register.login.market;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/saved-market", "/api/v1/saved-market-data"})
public class SavedMarketController {

    private final SavedMarketService savedMarketService;

    public SavedMarketController(SavedMarketService savedMarketService) {
        this.savedMarketService = savedMarketService;
    }

    @PostMapping
    public ResponseEntity<SavedMarketResponse> saveMarketData(
            @RequestBody SaveMarketRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return new ResponseEntity<>(savedMarketService.save(userId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<SavedMarketResponse> getAllSavedMarketData(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return savedMarketService.getAll(userId, page, size);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarketData(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        savedMarketService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
