CREATE TABLE conversation (
    conversation_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    approach_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    buyer_name VARCHAR(120) NOT NULL,
    farmer_id BIGINT NOT NULL,
    farmer_name VARCHAR(120) NOT NULL,
    listing_id BIGINT NOT NULL,
    listing_name VARCHAR(160) NOT NULL,
    requested_quantity DOUBLE NOT NULL,
    status VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    pending_deal_quantity DOUBLE NULL,
    buyer_deal_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    farmer_deal_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    expired_at TIMESTAMP NULL,
    CONSTRAINT uk_conversation_approach UNIQUE (approach_id)
);

CREATE INDEX idx_conversation_buyer ON conversation (buyer_id);
CREATE INDEX idx_conversation_farmer ON conversation (farmer_id);
CREATE INDEX idx_conversation_listing ON conversation (listing_id);
CREATE INDEX idx_conversation_status_last_message ON conversation (status, last_message_at);

CREATE TABLE chat_message (
    message_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversation (conversation_id)
);

CREATE INDEX idx_chat_message_conversation_created ON chat_message (conversation_id, created_at);
