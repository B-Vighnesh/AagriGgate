package com.MyWebpage.register.login.otp;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "otp_token",
        uniqueConstraints = @UniqueConstraint(name = "uk_otp_token_principal_purpose", columnNames = {"principal", "purpose"})
)
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String principal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OtpPurpose purpose;

    @Column(name = "code", nullable = false, length = 32)
    private String code;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean verified;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
