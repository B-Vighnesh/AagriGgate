package com.MyWebpage.register.login.news.controller;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.news.dto.response.NewsResponse;
import com.MyWebpage.register.login.news.enums.DateRange;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public ResponseEntity<ApiResponse<Page<NewsResponse>>> getNews(
            Authentication authentication,
            @RequestParam(required = false) NewsCategory category,
            @RequestParam(required = false) NewsType newsType,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean isImportant,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) DateRange dateRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        Long currentUserId = extractCurrentUserId(authentication);
        Page<NewsResponse> data = newsService.getAllNews(category, newsType, language, isImportant, keyword, dateRange, currentUserId, page, size, sortBy);
        return ResponseEntity.ok(ApiResponse.success("News fetched", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> getNewsById(@PathVariable Long id, Authentication authentication) {
        Long currentUserId = extractCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("News fetched", newsService.getNewsById(id, currentUserId)));
    }

// TODO: Report feature temporarily disabled — to be re-enabled in future release.
/*
    @PostMapping("/{id}/report")
    public ResponseEntity<ApiResponse<String>> reportNews(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        Long.parseLong(authentication.getName());
        String reason = payload == null ? null : payload.get("reason");
        newsService.reportNews(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Report submitted", "OK"));
    }
*/

    private Long extractCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }
}
