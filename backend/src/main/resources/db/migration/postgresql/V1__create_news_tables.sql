CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(1000) NOT NULL,
    source_name VARCHAR(255),
    source_url VARCHAR(1000) NOT NULL,
    source_url_hash CHAR(64) NOT NULL,
    image_url VARCHAR(1000),
    category VARCHAR(50) NOT NULL,
    news_type VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_news_source_url_hash UNIQUE (source_url_hash)
);

CREATE TABLE trusted_sources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    source_url VARCHAR(1000) NOT NULL,
    category_scope VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_fetched_at TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_news (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    news_id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_saved_news_user_news UNIQUE (user_id, news_id),
    CONSTRAINT fk_saved_news_news FOREIGN KEY (news_id) REFERENCES news (id)
);

CREATE TABLE notification_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    news_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP(6),
    read_at TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_log_news FOREIGN KEY (news_id) REFERENCES news (id)
);

CREATE INDEX idx_news_category ON news (category);
CREATE INDEX idx_news_news_type ON news (news_type);
CREATE INDEX idx_news_is_important ON news (is_important);
CREATE INDEX idx_news_created_at ON news (created_at);
CREATE INDEX idx_news_language ON news (language);
CREATE INDEX idx_news_status ON news (status);
CREATE INDEX idx_trusted_sources_is_active ON trusted_sources (is_active);
CREATE INDEX idx_saved_news_user_id ON saved_news (user_id);
CREATE INDEX idx_notification_log_user_news ON notification_log (user_id, news_id);
