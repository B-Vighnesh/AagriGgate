package com.MyWebpage.register.login.news.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.news.dto.SavedNewsResponse;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.service.SavedNewsService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/news/saved")
public class SavedNewsController {

    private final SavedNewsService savedNewsService;

    public SavedNewsController(SavedNewsService savedNewsService) {
        this.savedNewsService = savedNewsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SavedNewsResponse>>> getSavedNews(
            Authentication authentication,
            @RequestParam(required = false) NewsCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        Page<SavedNewsResponse> response = savedNewsService.getSavedNews(userId, category, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Saved news fetched", response));
    }

    @PostMapping("/{newsId}")
    public ResponseEntity<ApiResponse<String>> saveNews(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        savedNewsService.saveNews(userId, newsId);
        return ResponseEntity.ok(ApiResponse.success("News saved", "OK"));
    }

    @DeleteMapping("/{newsId}")
    public ResponseEntity<ApiResponse<String>> unsaveNews(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        savedNewsService.unsaveNews(userId, newsId);
        return ResponseEntity.ok(ApiResponse.success("News removed from saved list", "OK"));
    }

    @GetMapping("/{newsId}/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getSavedStatus(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Saved status fetched", Map.of("saved", savedNewsService.isSaved(userId, newsId))));
    }
}
