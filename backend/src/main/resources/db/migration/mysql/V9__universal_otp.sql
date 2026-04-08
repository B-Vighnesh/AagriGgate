CREATE TABLE otp_token (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    principal VARCHAR(255) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    verified BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_otp_token_principal_purpose (principal, purpose),
    INDEX idx_otp_token_expires_at (expires_at)
);
