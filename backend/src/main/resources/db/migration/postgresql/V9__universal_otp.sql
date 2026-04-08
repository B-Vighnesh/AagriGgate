CREATE TABLE otp_token (
    id BIGSERIAL PRIMARY KEY,
    principal VARCHAR(255) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_otp_token_principal_purpose ON otp_token (principal, purpose);
CREATE INDEX idx_otp_token_expires_at ON otp_token (expires_at);
