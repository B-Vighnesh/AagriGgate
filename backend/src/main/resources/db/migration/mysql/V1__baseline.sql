CREATE TABLE IF NOT EXISTS farmer_sequence (
    next_val BIGINT
) ENGINE=InnoDB;

INSERT INTO farmer_sequence (next_val)
SELECT 10101
WHERE NOT EXISTS (SELECT 1 FROM farmer_sequence);

CREATE TABLE IF NOT EXISTS crop_sequence (
    next_val BIGINT
) ENGINE=InnoDB;

INSERT INTO crop_sequence (next_val)
SELECT 10011
WHERE NOT EXISTS (SELECT 1 FROM crop_sequence);

CREATE TABLE IF NOT EXISTS approach_sequence (
    next_val BIGINT
) ENGINE=InnoDB;

INSERT INTO approach_sequence (next_val)
SELECT 1000
WHERE NOT EXISTS (SELECT 1 FROM approach_sequence);

CREATE TABLE IF NOT EXISTS favorite_sequence (
    next_val BIGINT
) ENGINE=InnoDB;

INSERT INTO favorite_sequence (next_val)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM favorite_sequence);

CREATE TABLE IF NOT EXISTS cart_sequence (
    next_val BIGINT
) ENGINE=InnoDB;

INSERT INTO cart_sequence (next_val)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM cart_sequence);

CREATE TABLE IF NOT EXISTS farmer (
    farmer_id BIGINT NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone_no VARCHAR(255),
    dob VARCHAR(255),
    state VARCHAR(255),
    city VARCHAR(255),
    district VARCHAR(255),
    aadhar_no VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(255),
    PRIMARY KEY (farmer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS crop (
    crop_id BIGINT NOT NULL,
    crop_name VARCHAR(255),
    crop_type VARCHAR(255),
    region VARCHAR(255),
    market_price DOUBLE,
    quantity DOUBLE,
    image_name VARCHAR(255),
    image_type VARCHAR(255),
    unit VARCHAR(255),
    description VARCHAR(255),
    is_urgent TINYINT(1),
    is_waste TINYINT(1),
    discount_price DOUBLE,
    status VARCHAR(255),
    image_data LONGBLOB,
    farmer_id BIGINT NOT NULL,
    post_date VARCHAR(255),
    PRIMARY KEY (crop_id),
    CONSTRAINT fk_crop_farmer FOREIGN KEY (farmer_id) REFERENCES farmer (farmer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS approach_farmer (
    approach_id BIGINT NOT NULL,
    crop_id BIGINT,
    crop_name VARCHAR(255),
    farmer_id BIGINT,
    farmer_name VARCHAR(255),
    farmer_phone_no VARCHAR(255),
    farmer_email VARCHAR(255),
    farmer_location VARCHAR(255),
    user_id BIGINT,
    user_name VARCHAR(255),
    user_phone_no VARCHAR(255),
    user_email VARCHAR(255),
    requested_quantity DOUBLE,
    accept TINYINT(1),
    status VARCHAR(255),
    PRIMARY KEY (approach_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT NOT NULL,
    buyer_id BIGINT,
    crop_id BIGINT,
    created_at DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT uk_favorites_buyer_crop UNIQUE (buyer_id, crop_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT NOT NULL,
    buyer_id BIGINT,
    crop_id BIGINT,
    quantity DOUBLE,
    created_at DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT uk_cart_items_buyer_crop UNIQUE (buyer_id, crop_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_market_data (
    id BIGINT NOT NULL AUTO_INCREMENT,
    farmer_id VARCHAR(255),
    arrival_date VARCHAR(255),
    commodity VARCHAR(255),
    commodity_code VARCHAR(255),
    district VARCHAR(255),
    grade VARCHAR(255),
    market VARCHAR(255),
    max_price VARCHAR(255),
    min_price VARCHAR(255),
    modal_price VARCHAR(255),
    state VARCHAR(255),
    variety VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS verification_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token VARCHAR(255),
    farmer_id BIGINT NOT NULL,
    expiry_date DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT uk_verification_token_farmer UNIQUE (farmer_id),
    CONSTRAINT fk_verification_token_farmer FOREIGN KEY (farmer_id) REFERENCES farmer (farmer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registration_otp (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255),
    otp VARCHAR(255),
    expiry_time DATETIME,
    verified TINYINT(1),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_otp (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255),
    otp VARCHAR(255),
    expiry_time DATETIME,
    verified TINYINT(1),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_otp (
    id BIGINT NOT NULL AUTO_INCREMENT,
    farmer_id BIGINT,
    otp VARCHAR(255),
    expiry_time DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiry (
    id BIGINT NOT NULL AUTO_INCREMENT,
    message VARCHAR(255) NOT NULL,
    submitted_at DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
