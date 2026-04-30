ALTER TABLE approach_farmer
    ADD COLUMN requested_at TIMESTAMP NULL,
    ADD COLUMN accepted_at TIMESTAMP NULL,
    ADD COLUMN rejected_at TIMESTAMP NULL,
    ADD COLUMN last_message_at TIMESTAMP NULL,
    ADD COLUMN last_message_sender_id BIGINT NULL,
    ADD COLUMN notified_at TIMESTAMP NULL,
    ADD COLUMN completed_at TIMESTAMP NULL,
    ADD COLUMN failed_at TIMESTAMP NULL,
    ADD COLUMN expired_at TIMESTAMP NULL;

UPDATE approach_farmer
SET requested_at = COALESCE(requested_at, deleted_at, CURRENT_TIMESTAMP)
WHERE requested_at IS NULL;
