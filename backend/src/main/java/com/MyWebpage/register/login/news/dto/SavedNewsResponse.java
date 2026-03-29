package com.MyWebpage.register.login.news.dto;

import java.time.LocalDateTime;

public class SavedNewsResponse {
    private Long id;
    private NewsResponse news;
    private LocalDateTime savedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NewsResponse getNews() {
        return news;
    }

    public void setNews(NewsResponse news) {
        this.news = news;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
