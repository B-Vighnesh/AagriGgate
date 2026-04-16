CREATE TABLE IF NOT EXISTS user_block (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_block (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS user_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_id BIGINT NOT NULL,
    reason VARCHAR(255) NULL,
    message TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
