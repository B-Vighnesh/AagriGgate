CREATE TABLE IF NOT EXISTS notification_category (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    default_delivery_type VARCHAR(20) NOT NULL,
    default_severity VARCHAR(20) NOT NULL,
    is_location_based BOOLEAN NOT NULL DEFAULT FALSE,
    is_price_based BOOLEAN NOT NULL DEFAULT FALSE,
    is_user_specific BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_notification_category_name UNIQUE (category_name)
);

CREATE TABLE IF NOT EXISTS user_category_preference (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    delivery_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_category_preference UNIQUE (user_id, category_id),
    CONSTRAINT fk_user_category_preference_category FOREIGN KEY (category_id) REFERENCES notification_category (id)
);

CREATE TABLE IF NOT EXISTS user_message (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    message_text VARCHAR(2000) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL,
    category_id BIGINT NOT NULL,
    reference_type VARCHAR(20),
    reference_id BIGINT,
    target_type VARCHAR(20) NOT NULL,
    location_state VARCHAR(120),
    location_district VARCHAR(160),
    severity VARCHAR(20) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_interval_minutes INT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_message_category FOREIGN KEY (category_id) REFERENCES notification_category (id)
);

CREATE INDEX IF NOT EXISTS idx_user_category_preference_user_id ON user_category_preference (user_id);
CREATE INDEX IF NOT EXISTS idx_user_message_user_delivery_created ON user_message (user_id, delivery_type, created_at);
CREATE INDEX IF NOT EXISTS idx_user_message_user_read ON user_message (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_message_user_ack ON user_message (user_id, is_acknowledged);

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'REQUEST', 'Buyer or seller request lifecycle updates', 'NOTIFICATION', 'MEDIUM', FALSE, FALSE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'REQUEST');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'PRICE_THRESHOLD', 'Price rule based market trigger', 'NOTIFICATION', 'MEDIUM', FALSE, TRUE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'PRICE_THRESHOLD');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'NEWS_IMPORTANT', 'Important news from trusted sources', 'NOTIFICATION', 'LOW', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'NEWS_IMPORTANT');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'SUBSIDY', 'Government subsidy updates', 'NOTIFICATION', 'LOW', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'SUBSIDY');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'LOAN', 'Loan and finance related updates', 'NOTIFICATION', 'LOW', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'LOAN');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'LAW', 'Agriculture regulation and law updates', 'NOTIFICATION', 'MEDIUM', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'LAW');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'WEATHER', 'General weather update', 'NOTIFICATION', 'MEDIUM', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'WEATHER');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'WEATHER_RAIN', 'Heavy rain warning', 'ALERT', 'HIGH', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'WEATHER_RAIN');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'WEATHER_FLOOD', 'Flood warning', 'ALERT', 'CRITICAL', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'WEATHER_FLOOD');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'WEATHER_CYCLONE', 'Cyclone warning', 'ALERT', 'CRITICAL', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'WEATHER_CYCLONE');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'DAM', 'Dam release or safety warning', 'ALERT', 'CRITICAL', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'DAM');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'LOCKDOWN', 'Emergency restriction or movement warning', 'ALERT', 'HIGH', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'LOCKDOWN');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'ADMIN_ANNOUNCEMENT', 'Administrative announcement for users', 'NOTIFICATION', 'MEDIUM', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'ADMIN_ANNOUNCEMENT');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'AI_CROP_DISEASE', 'AI detected crop disease warning', 'ALERT', 'HIGH', TRUE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'AI_CROP_DISEASE');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'MARKET', 'General market update', 'NOTIFICATION', 'MEDIUM', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'MARKET');

INSERT INTO notification_category (category_name, description, default_delivery_type, default_severity, is_location_based, is_price_based, is_user_specific, created_at, updated_at)
SELECT 'CROP', 'Crop specific update for interested users', 'NOTIFICATION', 'MEDIUM', FALSE, FALSE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM notification_category WHERE category_name = 'CROP');
