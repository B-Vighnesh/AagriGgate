package com.MyWebpage.register.login.news.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.Locale;

public class TrustedSourceRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String domain;

    @NotBlank
    @Size(max = 1000)
    @URL
    private String sourceUrl;

    @Size(max = 255)
    private String categoryScope;

    @NotBlank
    @Size(max = 50)
    private String sourceType;

    @Size(max = 255)
    private String fetchKeyword;

    private Boolean isActive;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getCategoryScope() {
        return categoryScope;
    }

    public void setCategoryScope(String categoryScope) {
        this.categoryScope = categoryScope;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getFetchKeyword() {
        return fetchKeyword;
    }

    public void setFetchKeyword(String fetchKeyword) {
        this.fetchKeyword = fetchKeyword;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    @AssertTrue(message = "sourceType must be RSS, GNEWS_TOPIC, or GNEWS_KEYWORD")
    public boolean isSourceTypeValid() {
        if (sourceType == null || sourceType.isBlank()) {
            return true;
        }
        String normalized = sourceType.trim().toUpperCase(Locale.ROOT);
        return normalized.equals("RSS") || normalized.equals("GNEWS_TOPIC") || normalized.equals("GNEWS_KEYWORD");
    }
}
