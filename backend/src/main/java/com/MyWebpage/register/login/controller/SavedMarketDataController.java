package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.SavedMarketData;
import com.MyWebpage.register.login.service.SavedMarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-market-data")
public class SavedMarketDataController {

    @Autowired
    private SavedMarketDataService savedMarketDataService;

    @PostMapping("/save")
    public ResponseEntity<SavedMarketData> saveMarketData(@RequestBody SavedMarketData data) {
        System.out.println(data);
        return new ResponseEntity<>(savedMarketDataService.save(data), HttpStatus.CREATED);
    }

    @GetMapping("/getAll")
    public List<SavedMarketData> getAllSavedMarketData(@RequestHeader("X-Farmer-Id") String farmerId) {
        System.out.println(farmerId);
        return savedMarketDataService.getAll(farmerId);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteMarketData(@RequestHeader("X-Id") Long id) {
        System.out.println(id);
        savedMarketDataService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
