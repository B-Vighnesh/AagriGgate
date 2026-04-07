package com.MyWebpage.register.login.enquiry;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    private LocalDateTime submittedAt = LocalDateTime.now();
    private Boolean active = true;
    private LocalDateTime deletedAt;

    public Enquiry() {
    }

    public Enquiry(Long id, String message, LocalDateTime submittedAt) {
        this.id = id;
        this.message = message;
        this.submittedAt = submittedAt;
    }

    @Override
    public String toString() {
        return "Enquiry{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", submittedAt=" + submittedAt +
                '}';
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
