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
@RequestMapping("/api/v1/saved-market-data")
public class SavedMarketDataController {

    private final SavedMarketDataService savedMarketDataService;

    public SavedMarketDataController(SavedMarketDataService savedMarketDataService) {
        this.savedMarketDataService = savedMarketDataService;
    }

    @PostMapping
    public ResponseEntity<SavedMarketData> saveMarketData(
            @RequestBody SavedMarketData data,
            Authentication authentication) {
        String farmerId = authentication.getName();
        return new ResponseEntity<>(savedMarketDataService.save(farmerId, data), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<SavedMarketData> getAllSavedMarketData(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String farmerId = authentication.getName();
        return savedMarketDataService.getAll(farmerId, page, size);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarketData(
            @PathVariable Long id,
            Authentication authentication) {
        String farmerId = authentication.getName();
        savedMarketDataService.delete(farmerId, id);
        return ResponseEntity.noContent().build();
    }
}
