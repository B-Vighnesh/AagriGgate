ALTER TABLE chat_message
    ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN read_at DATETIME NULL,
    ADD COLUMN delivery_status VARCHAR(32) NOT NULL DEFAULT 'SENT';

ALTER TABLE conversation
    ADD COLUMN buyer_unread_count INT NOT NULL DEFAULT 0,
    ADD COLUMN farmer_unread_count INT NOT NULL DEFAULT 0,
    ADD COLUMN last_message_sender_id BIGINT NULL,
    ADD COLUMN last_message_preview VARCHAR(255) NULL;
