package com.MyWebpage.register.login.support.dto;

import com.MyWebpage.register.login.support.SupportStatus;
import com.MyWebpage.register.login.support.SupportType;

import java.time.LocalDateTime;

public class SupportRequestSummaryDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private SupportType type;
    private String subject;
    private String message;
    private SupportStatus status;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SupportRequestSummaryDTO() {
    }

    public SupportRequestSummaryDTO(
            Long id,
            Long userId,
            String name,
            String email,
            SupportType type,
            String subject,
            String message,
            SupportStatus status,
            Boolean isDeleted,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.type = type;
        this.subject = subject;
        this.message = message;
        this.status = status;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public SupportType getType() {
        return type;
    }

    public void setType(SupportType type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public SupportStatus getStatus() {
        return status;
    }

    public void setStatus(SupportStatus status) {
        this.status = status;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
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
}
