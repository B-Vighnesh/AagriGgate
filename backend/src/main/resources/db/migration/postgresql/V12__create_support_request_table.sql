DO $$
BEGIN
    CREATE TYPE support_request_type AS ENUM ('CONTACT', 'COMPLAINT', 'FEEDBACK', 'ENQUIRY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE support_request_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS support_request (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    name VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    type support_request_type NOT NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    image_data BYTEA NULL,
    image_name VARCHAR(255) NULL,
    image_type VARCHAR(100) NULL,
    status support_request_status NOT NULL DEFAULT 'OPEN',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_request_farmer FOREIGN KEY (user_id) REFERENCES farmer (farmer_id)
);

CREATE INDEX IF NOT EXISTS idx_support_request_email_deleted ON support_request (email, is_deleted);
CREATE INDEX IF NOT EXISTS idx_support_request_deleted_created ON support_request (is_deleted, created_at);

CREATE OR REPLACE FUNCTION update_support_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_request_updated_at ON support_request;

CREATE TRIGGER trg_support_request_updated_at
    BEFORE UPDATE ON support_request
    FOR EACH ROW
    EXECUTE FUNCTION update_support_request_updated_at();
