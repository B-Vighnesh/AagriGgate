ALTER TABLE otp_token
    RENAME COLUMN otp_hash TO code;

ALTER TABLE otp_token
    ALTER COLUMN code TYPE VARCHAR(32);

ALTER TABLE otp_token
    ADD CONSTRAINT uk_otp_token_principal_purpose UNIQUE (principal, purpose);
