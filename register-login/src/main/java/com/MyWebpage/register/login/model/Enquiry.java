package com.MyWebpage.register.login.model;

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
}
