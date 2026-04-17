ALTER TABLE conversation
    ADD COLUMN buyer_archived_at DATETIME NULL,
    ADD COLUMN farmer_archived_at DATETIME NULL,
    ADD COLUMN buyer_deleted_at DATETIME NULL,
    ADD COLUMN farmer_deleted_at DATETIME NULL;

CREATE INDEX idx_conversation_buyer_visibility
    ON conversation (buyer_id, buyer_deleted_at, buyer_archived_at, status, last_message_at);

CREATE INDEX idx_conversation_farmer_visibility
    ON conversation (farmer_id, farmer_deleted_at, farmer_archived_at, status, last_message_at);
