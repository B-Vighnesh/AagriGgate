ALTER TABLE otp_token
    CHANGE COLUMN otp_hash code VARCHAR(32) NOT NULL;

ALTER TABLE otp_token
    ADD CONSTRAINT uk_otp_token_principal_purpose UNIQUE (principal, purpose);
