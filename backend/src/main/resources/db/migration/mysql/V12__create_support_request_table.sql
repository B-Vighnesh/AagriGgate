CREATE TABLE IF NOT EXISTS support_request (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NULL,
    name VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    type ENUM('CONTACT', 'COMPLAINT', 'FEEDBACK', 'ENQUIRY') NOT NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    image_data LONGBLOB NULL,
    image_name VARCHAR(255) NULL,
    image_type VARCHAR(100) NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_support_request_farmer FOREIGN KEY (user_id) REFERENCES farmer (farmer_id)
) ENGINE=InnoDB;

CREATE INDEX idx_support_request_email_deleted ON support_request (email, is_deleted);
CREATE INDEX idx_support_request_deleted_created ON support_request (is_deleted, created_at);
