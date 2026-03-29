package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.dto.SavedNewsResponse;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import org.springframework.data.domain.Page;

public interface SavedNewsService {
    void saveNews(Long userId, Long newsId);

    void unsaveNews(Long userId, Long newsId);

    Page<SavedNewsResponse> getSavedNews(Long userId, NewsCategory category, String keyword, int page, int size);

    boolean isSaved(Long userId, Long newsId);
}
