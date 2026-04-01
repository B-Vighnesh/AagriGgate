package com.MyWebpage.register.login.news.entity;

import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "news",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_news_source_url_hash", columnNames = "source_url_hash")
        },
        indexes = {
                @Index(name = "idx_news_category", columnList = "category"),
                @Index(name = "idx_news_news_type", columnList = "news_type"),
                @Index(name = "idx_news_is_important", columnList = "is_important"),
                @Index(name = "idx_news_published_at", columnList = "published_at"),
                @Index(name = "idx_news_created_at", columnList = "created_at"),
                @Index(name = "idx_news_language", columnList = "language"),
                @Index(name = "idx_news_status", columnList = "status")
        }
)
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "source_url", nullable = false, length = 1000)
    private String sourceUrl;

    @Column(name = "source_url_hash", nullable = false, length = 64)
    private String sourceUrlHash;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NewsCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "news_type", nullable = false, length = 50)
    private NewsType newsType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NewsStatus status = NewsStatus.ACTIVE;

    @Column(nullable = false, length = 10)
    private String language = "en";

    @Column(name = "is_important", nullable = false)
    private Boolean isImportant = false;

    @Column(name = "uploaded_by", nullable = false, length = 20)
    private String uploadedBy = "SYSTEM";

    @Column(name = "report_reason", length = 500)
    private String reportReason;

    @Column(name = "report_count", nullable = false)
    private Integer reportCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getSourceUrlHash() {
        return sourceUrlHash;
    }

    public void setSourceUrlHash(String sourceUrlHash) {
        this.sourceUrlHash = sourceUrlHash;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
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

    public NewsStatus getStatus() {
        return status;
    }

    public void setStatus(NewsStatus status) {
        this.status = status;
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

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getReportReason() {
        return reportReason;
    }

    public void setReportReason(String reportReason) {
        this.reportReason = reportReason;
    }

    public Integer getReportCount() {
        return reportCount;
    }

    public void setReportCount(Integer reportCount) {
        this.reportCount = reportCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    private void syncSourceUrlHash() {
        String dedupInput = buildDedupInput(title, sourceUrl);
        if (dedupInput != null) {
            this.sourceUrlHash = sha256(dedupInput);
        }
    }

    public static String buildSourceUrlHash(String title, String sourceUrl) {
        String dedupInput = buildDedupInput(title, sourceUrl);
        return dedupInput == null ? null : sha256(dedupInput);
    }

    private static String buildDedupInput(String title, String sourceUrl) {
        if (title == null || title.isBlank() || sourceUrl == null || sourceUrl.isBlank()) {
            return null;
        }
        return title.trim().toLowerCase() + "|" + sourceUrl.trim().toLowerCase();
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte current : bytes) {
                builder.append(String.format("%02x", current));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to hash source URL", ex);
        }
    }
}
