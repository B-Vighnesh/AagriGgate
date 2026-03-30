package com.MyWebpage.register.login.news.mapper;

import com.MyWebpage.register.login.news.dto.response.SavedNewsResponse;
import com.MyWebpage.register.login.news.entity.SavedNews;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class SavedNewsMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    private final NewsMapper newsMapper;

    public SavedNewsMapper(NewsMapper newsMapper) {
        this.newsMapper = newsMapper;
    }

    public SavedNewsResponse toResponse(SavedNews savedNews) {
        SavedNewsResponse response = new SavedNewsResponse();
        response.setSavedId(savedNews.getId());
        response.setNews(newsMapper.toResponse(savedNews.getNews(), true));
        response.setSavedAt(format(savedNews.getCreatedAt()));
        return response;
    }

    private String format(LocalDateTime value) {
        return value == null ? null : value.format(FORMATTER);
    }
}
