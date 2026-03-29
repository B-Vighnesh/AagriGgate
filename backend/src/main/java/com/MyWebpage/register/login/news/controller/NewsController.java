package com.MyWebpage.register.login.news.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.news.dto.NewsResponse;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NewsResponse>>> getAllNews(
            Authentication authentication,
            @RequestParam(required = false) NewsCategory category,
            @RequestParam(required = false) NewsType newsType,
            @RequestParam(required = false, defaultValue = "en") String language,
            @RequestParam(required = false) Boolean isImportant,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        Long userId = extractUserId(authentication);
        Page<NewsResponse> response = newsService.getAllNews(category, newsType, language, isImportant, keyword, page, size, sortBy, userId);
        return ResponseEntity.ok(ApiResponse.success("News fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> getNewsById(@PathVariable Long id, Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("News fetched", newsService.getNewsById(id, userId)));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> trackNewsView(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("News view tracked", "OK"));
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
