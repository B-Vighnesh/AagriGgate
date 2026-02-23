package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.SavedMarketData;
import com.MyWebpage.register.login.service.SavedMarketDataService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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
    public ResponseEntity<SavedMarketData> saveMarketData(@RequestBody SavedMarketData data) {
        return new ResponseEntity<>(savedMarketDataService.save(data), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<SavedMarketData> getAllSavedMarketData(
            @RequestHeader("X-Farmer-Id") String farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return savedMarketDataService.getAll(farmerId, page, size);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMarketData(@RequestHeader("X-Id") Long id) {
        savedMarketDataService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
