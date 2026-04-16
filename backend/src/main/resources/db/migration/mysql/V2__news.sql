CREATE TABLE IF NOT EXISTS news (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    source_name VARCHAR(200),
    source_url VARCHAR(1000) NOT NULL,
    source_url_hash CHAR(64) NOT NULL,
    image_url VARCHAR(1000),
    category VARCHAR(50) NOT NULL,
    news_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_important TINYINT(1) NOT NULL DEFAULT 0,
    uploaded_by VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
    report_reason VARCHAR(500),
    report_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_news_title UNIQUE (title),
    CONSTRAINT uk_news_source_url_hash UNIQUE (source_url_hash)
) ENGINE=InnoDB;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_category'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_category ON news (category)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_news_type'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_news_type ON news (news_type)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_is_important'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_is_important ON news (is_important)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_created_at'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_created_at ON news (created_at)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_language'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_language ON news (language)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'news'
      AND index_name = 'idx_news_status'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_news_status ON news (status)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS trusted_source (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    source_url VARCHAR(1000) NOT NULL,
    category_scope VARCHAR(255),
    source_type VARCHAR(50) NOT NULL,
    fetch_keyword VARCHAR(255),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_fetched_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'trusted_source'
      AND index_name = 'idx_trusted_source_is_active'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_trusted_source_is_active ON trusted_source (is_active)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS saved_news (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    news_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_saved_news_user_news UNIQUE (user_id, news_id),
    CONSTRAINT fk_saved_news_news FOREIGN KEY (news_id) REFERENCES news (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'notification'
      AND index_name = 'idx_notification_user_status_type_created'
);
SET @sql = IF(
    @index_exists = 0,
    'CREATE INDEX idx_notification_user_status_type_created ON notification (user_id, status, type, created_at)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'notification'
      AND index_name = 'idx_notification_user_id'
);
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_notification_user_id ON notification (user_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS user_notification_preference (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_user_notification_preference UNIQUE (user_id, notification_type)
) ENGINE=InnoDB;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'user_notification_preference'
      AND index_name = 'idx_user_notification_preference_user_id'
);
SET @sql = IF(
    @index_exists = 0,
    'CREATE INDEX idx_user_notification_preference_user_id ON user_notification_preference (user_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'PIB Agriculture', 'pib.gov.in', 'https://gnews.io/api/v4/top-headlines', 'SUBSIDY,LAW', 'GNEWS_TOPIC', 'agriculture', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'PIB Agriculture');

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'Krishi Jagran', 'krishijagran.com', 'https://krishijagran.com/feed/', 'FARMING_TIP,MARKET', 'RSS', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'Krishi Jagran');

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'AgriFarming', 'agrifarming.in', 'https://www.agrifarming.in/feed', 'FARMING_TIP', 'RSS', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'AgriFarming');

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'Kisan Subsidy News', 'gnews.io', 'https://gnews.io/api/v4/search', 'SUBSIDY,LOAN', 'GNEWS_KEYWORD', 'kisan subsidy scheme', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'Kisan Subsidy News');

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'Mandi Price News', 'gnews.io', 'https://gnews.io/api/v4/search', 'MARKET', 'GNEWS_KEYWORD', 'mandi price krishi', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'Mandi Price News');
