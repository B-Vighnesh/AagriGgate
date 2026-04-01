package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.exception.AlreadySavedException;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.news.dto.response.SavedNewsResponse;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.SavedNews;
import com.MyWebpage.register.login.news.enums.DateRange;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.mapper.SavedNewsMapper;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.SavedNewsRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class SavedNewsServiceImpl implements SavedNewsService {

    private final SavedNewsRepository savedNewsRepository;
    private final NewsRepository newsRepository;
    private final SavedNewsMapper savedNewsMapper;

    public SavedNewsServiceImpl(
            SavedNewsRepository savedNewsRepository,
            NewsRepository newsRepository,
            SavedNewsMapper savedNewsMapper
    ) {
        this.savedNewsRepository = savedNewsRepository;
        this.newsRepository = newsRepository;
        this.savedNewsMapper = savedNewsMapper;
    }

    @Override
    @Transactional
    public SavedNewsResponse saveNews(Long userId, Long newsId) {
        News news = newsRepository.findByIdAndStatus(newsId, NewsStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + newsId));

        if (savedNewsRepository.existsByUserIdAndNews_Id(userId, newsId)) {
            throw new AlreadySavedException("News is already saved");
        }

        SavedNews savedNews = new SavedNews();
        savedNews.setUserId(userId);
        savedNews.setNews(news);
        return savedNewsMapper.toResponse(savedNewsRepository.save(savedNews));
    }

    @Override
    @Transactional
    public void unsaveNews(Long userId, Long newsId) {
        SavedNews savedNews = savedNewsRepository.findByUserIdAndNews_Id(userId, newsId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved news not found for news ID: " + newsId));
        savedNewsRepository.delete(savedNews);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SavedNewsResponse> getSavedNews(Long userId, NewsCategory category, String keyword, DateRange dateRange, int page, int size) {
        List<SavedNews> savedItems = savedNewsRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(item -> item.getNews() != null && item.getNews().getStatus() == NewsStatus.ACTIVE)
                .filter(item -> category == null || item.getNews().getCategory() == category)
                .filter(item -> matchesKeyword(item, keyword))
                .filter(item -> matchesDateRange(item.getNews(), dateRange))
                .toList();

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        int fromIndex = Math.min(safePage * safeSize, savedItems.size());
        int toIndex = Math.min(fromIndex + safeSize, savedItems.size());
        Pageable pageable = PageRequest.of(safePage, safeSize);

        List<SavedNewsResponse> content = savedItems.subList(fromIndex, toIndex).stream()
                .map(savedNewsMapper::toResponse)
                .toList();

        return new PageImpl<>(content, pageable, savedItems.size());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSaved(Long userId, Long newsId) {
        return savedNewsRepository.existsByUserIdAndNews_Id(userId, newsId);
    }

    private boolean matchesKeyword(SavedNews savedNews, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String normalized = keyword.trim().toLowerCase(Locale.ROOT);
        News news = savedNews.getNews();
        return contains(news.getTitle(), normalized)
                || contains(news.getSummary(), normalized)
                || contains(news.getSourceName(), normalized);
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private boolean matchesDateRange(News news, DateRange dateRange) {
        if (dateRange == null || dateRange == DateRange.ALL || news.getCreatedAt() == null) {
            return true;
        }

        LocalDateTime now = LocalDateTime.now(com.MyWebpage.register.login.news.util.NewsTime.IST);
        LocalDateTime createdAt = news.getCreatedAt();

        return switch (dateRange) {
            case TODAY -> !createdAt.isBefore(now.toLocalDate().atStartOfDay()) && !createdAt.isAfter(now);
            case YESTERDAY -> !createdAt.isBefore(now.toLocalDate().minusDays(1).atStartOfDay())
                    && createdAt.isBefore(now.toLocalDate().atStartOfDay());
            case LAST_7_DAYS -> !createdAt.isBefore(now.minusDays(7)) && !createdAt.isAfter(now);
            case LAST_30_DAYS -> !createdAt.isBefore(now.minusDays(30)) && !createdAt.isAfter(now);
            case ALL -> true;
        };
    }
}
