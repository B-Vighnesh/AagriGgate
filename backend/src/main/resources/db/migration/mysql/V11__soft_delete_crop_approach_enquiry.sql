ALTER TABLE crop
    ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE approach_farmer
    ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE enquiry
    ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN deleted_at DATETIME NULL;

CREATE INDEX idx_crop_active_deleted_farmer ON crop (active, deleted_at, farmer_id);
CREATE INDEX idx_approach_farmer_active_deleted ON approach_farmer (active, deleted_at, farmer_id, user_id, crop_id);
CREATE INDEX idx_enquiry_active_deleted ON enquiry (active, deleted_at);
