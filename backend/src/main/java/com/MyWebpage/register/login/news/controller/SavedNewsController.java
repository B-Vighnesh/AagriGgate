package com.MyWebpage.register.login.news.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.news.dto.response.SavedNewsResponse;
import com.MyWebpage.register.login.news.enums.DateRange;
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
            @RequestParam(required = false) DateRange dateRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        Page<SavedNewsResponse> data = savedNewsService.getSavedNews(userId, category, keyword, dateRange, page, size);
        return ResponseEntity.ok(ApiResponse.success("Saved news fetched", data));
    }

    @PostMapping("/{newsId}")
    public ResponseEntity<ApiResponse<SavedNewsResponse>> saveNews(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        SavedNewsResponse response = savedNewsService.saveNews(userId, newsId);
        return ResponseEntity.ok(ApiResponse.success("News saved", response));
    }

    @DeleteMapping("/{newsId}")
    public ResponseEntity<ApiResponse<String>> unsaveNews(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        savedNewsService.unsaveNews(userId, newsId);
        return ResponseEntity.ok(ApiResponse.success("News unsaved", "OK"));
    }

    @GetMapping("/{newsId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkSaved(@PathVariable Long newsId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Saved status fetched", savedNewsService.isSaved(userId, newsId)));
    }
}
