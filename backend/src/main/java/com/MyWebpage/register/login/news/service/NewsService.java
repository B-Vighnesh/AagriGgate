package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.dto.NewsRequest;
import com.MyWebpage.register.login.news.dto.NewsResponse;
import com.MyWebpage.register.login.news.dto.TrustedSourceRequest;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import org.springframework.data.domain.Page;

import java.util.List;

public interface NewsService {
    Page<NewsResponse> getAllNews(
            NewsCategory category,
            NewsType newsType,
            String language,
            Boolean isImportant,
            String keyword,
            int page,
            int size,
            String sortBy,
            Long userId
    );

    NewsResponse getNewsById(Long id, Long userId);

    NewsResponse createNews(NewsRequest request, String uploadedBy);

    NewsResponse updateNews(Long id, NewsRequest request);

    void softDeleteNews(Long id);

    NewsResponse archiveNews(Long id);

    Page<NewsResponse> getAdminNews(NewsStatus status, String keyword, int page, int size, String sortBy);

    TrustedSource createTrustedSource(TrustedSourceRequest request);

    List<TrustedSource> getAllTrustedSources();

    TrustedSource updateTrustedSource(Long id, TrustedSourceRequest request);

    TrustedSource deactivateTrustedSource(Long id);
}
