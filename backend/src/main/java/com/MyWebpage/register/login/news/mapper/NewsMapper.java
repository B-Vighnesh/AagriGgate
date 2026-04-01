package com.MyWebpage.register.login.news.mapper;

import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.dto.response.NewsResponse;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class NewsMapper {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public NewsResponse toResponse(News news, boolean isSaved) {
        NewsResponse response = new NewsResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setSummary(news.getSummary());
        response.setSourceName(news.getSourceName());
        response.setSourceUrl(news.getSourceUrl());
        response.setImageUrl(news.getImageUrl());
        response.setCategory(news.getCategory() == null ? null : news.getCategory().name());
        response.setNewsType(news.getNewsType() == null ? null : news.getNewsType().name());
        response.setLanguage(news.getLanguage());
        response.setIsImportant(news.getIsImportant());
        response.setUploadedBy(news.getUploadedBy());
        response.setStatus(news.getStatus() == null ? null : news.getStatus().name());
        response.setReportCount(news.getReportCount());
        response.setIsSaved(isSaved);
        response.setPublishedAt(format(news.getPublishedAt()));
        response.setCreatedAt(format(news.getCreatedAt()));
        response.setUpdatedAt(format(news.getUpdatedAt()));
        return response;
    }

    public NewsResponse toResponse(News news) {
        return toResponse(news, false);
    }

    public News toEntity(NewsRequest request) {
        News news = new News();
        news.setTitle(request.getTitle());
        news.setSummary(request.getSummary());
        news.setSourceName(request.getSourceName());
        news.setSourceUrl(request.getSourceUrl());
        news.setImageUrl(request.getImageUrl());
        news.setCategory(request.getCategory());
        news.setNewsType(request.getNewsType());
        news.setLanguage(request.getLanguage() == null || request.getLanguage().isBlank() ? "en" : request.getLanguage().trim().toLowerCase());
        news.setIsImportant(Boolean.TRUE.equals(request.getIsImportant()));
        news.setPublishedAt(request.getPublishedAt());
        news.setStatus(NewsStatus.ACTIVE);
        news.setReportCount(0);
        return news;
    }

    public void updateEntity(News existing, NewsRequest request) {
        if (request.getTitle() != null) {
            existing.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            existing.setSummary(request.getSummary());
        }
        existing.setSourceName(request.getSourceName());
        if (request.getSourceUrl() != null) {
            existing.setSourceUrl(request.getSourceUrl());
        }
        existing.setImageUrl(request.getImageUrl());
        if (request.getPublishedAt() != null) {
            existing.setPublishedAt(request.getPublishedAt());
        }
        if (request.getCategory() != null) {
            existing.setCategory(request.getCategory());
        }
        if (request.getNewsType() != null) {
            existing.setNewsType(request.getNewsType());
        }
        existing.setLanguage(request.getLanguage() == null || request.getLanguage().isBlank() ? "en" : request.getLanguage().trim().toLowerCase());
        existing.setIsImportant(Boolean.TRUE.equals(request.getIsImportant()));
    }

    public Page<NewsResponse> toResponsePage(Page<News> page, boolean isSaved) {
        return page.map(news -> toResponse(news, isSaved));
    }

    private String format(LocalDateTime value) {
        return value == null ? null : value.format(ISO_FORMATTER);
    }
}
