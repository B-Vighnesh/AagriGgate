package com.MyWebpage.register.login.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TrustedSourceRequest {

    private static final String URL_REGEX = "^(https?://).+";

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String domain;

    @NotBlank
    @Size(max = 1000)
    @Pattern(regexp = URL_REGEX, message = "must be a valid URL")
    private String sourceUrl;

    @Size(max = 255)
    private String categoryScope;

    private Boolean isActive = true;

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }
}
