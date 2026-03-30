package com.MyWebpage.register.login.news.dto.response;

public class SavedNewsResponse {

    private Long savedId;
    private NewsResponse news;
    private String savedAt;

    public Long getSavedId() {
        return savedId;
    }

    public void setSavedId(Long savedId) {
        this.savedId = savedId;
    }

    public NewsResponse getNews() {
        return news;
    }

    public void setNews(NewsResponse news) {
        this.news = news;
    }

    public String getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(String savedAt) {
        this.savedAt = savedAt;
    }
}
