package com.MyWebpage.register.login.news.dto.request;

import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.net.URI;

public class NewsRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String summary;

    @Size(max = 200)
    private String sourceName;

    @NotBlank
    @Size(max = 1000)
    @URL
    private String sourceUrl;

    @Size(max = 1000)
    private String imageUrl;

    @NotNull
    private NewsCategory category;

    @NotNull
    private NewsType newsType;

    @Size(max = 10)
    private String language;

    private Boolean isImportant;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public NewsCategory getCategory() {
        return category;
    }

    public void setCategory(NewsCategory category) {
        this.category = category;
    }

    public NewsType getNewsType() {
        return newsType;
    }

    public void setNewsType(NewsType newsType) {
        this.newsType = newsType;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Boolean getIsImportant() {
        return isImportant;
    }

    public void setIsImportant(Boolean important) {
        isImportant = important;
    }

    @AssertTrue(message = "imageUrl must be a valid URL")
    public boolean isImageUrlValid() {
        if (imageUrl == null || imageUrl.isBlank()) {
            return true;
        }
        try {
            URI uri = URI.create(imageUrl.trim());
            return uri.getScheme() != null && uri.getHost() != null;
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public String toString() {
        return "NewsRequest{" +
                "title='" + title + '\'' +
                ", summary='" + summary + '\'' +
                ", sourceName='" + sourceName + '\'' +
                ", sourceUrl='" + sourceUrl + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", category=" + category +
                ", newsType=" + newsType +
                ", language='" + language + '\'' +
                ", isImportant=" + isImportant +
                '}';
    }
}
