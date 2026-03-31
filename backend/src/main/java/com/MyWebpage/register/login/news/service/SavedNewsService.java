package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.dto.response.SavedNewsResponse;
import com.MyWebpage.register.login.news.enums.DateRange;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import org.springframework.data.domain.Page;

public interface SavedNewsService {

    SavedNewsResponse saveNews(Long userId, Long newsId);

    void unsaveNews(Long userId, Long newsId);

    Page<SavedNewsResponse> getSavedNews(Long userId, NewsCategory category, String keyword, DateRange dateRange, int page, int size);

    boolean isSaved(Long userId, Long newsId);
}
