package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.dto.request.TrustedSourceRequest;
import com.MyWebpage.register.login.news.dto.response.NewsResponse;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.DateRange;
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
            DateRange dateRange,
            Long currentUserId,
            int page,
            int size,
            String sortBy
    );

    NewsResponse getNewsById(Long id, Long currentUserId);

    NewsResponse createNews(NewsRequest request, String uploadedBy);

    NewsResponse updateNews(Long id, NewsRequest request);

    void softDeleteNews(Long id);

    void archiveNews(Long id);

    NewsResponse restoreNews(Long id);

// LEVEL 2 — Report feature disabled for Level 1 release
// Uncomment when content moderation workflow is implemented
//    void reportNews(Long newsId, String reason);

    Page<NewsResponse> getAdminNews(
            NewsStatus status,
            NewsCategory category,
            NewsType newsType,
            String keyword,
            int page,
            int size,
            String sortBy
    );

    TrustedSource createTrustedSource(TrustedSourceRequest request);

    List<TrustedSource> getAllTrustedSources();

    TrustedSource updateTrustedSource(Long id, TrustedSourceRequest request);

    TrustedSource deactivateTrustedSource(Long id);

    int triggerTrustedSourceFetch(Long id);
}
