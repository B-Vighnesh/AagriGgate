ALTER TABLE approach_farmer
    ADD COLUMN requested_at DATETIME NULL,
    ADD COLUMN accepted_at DATETIME NULL,
    ADD COLUMN rejected_at DATETIME NULL,
    ADD COLUMN last_message_at DATETIME NULL,
    ADD COLUMN last_message_sender_id BIGINT NULL,
    ADD COLUMN notified_at DATETIME NULL,
    ADD COLUMN completed_at DATETIME NULL,
    ADD COLUMN failed_at DATETIME NULL,
    ADD COLUMN expired_at DATETIME NULL;

UPDATE approach_farmer
SET requested_at = COALESCE(requested_at, deleted_at, NOW())
WHERE requested_at IS NULL;
