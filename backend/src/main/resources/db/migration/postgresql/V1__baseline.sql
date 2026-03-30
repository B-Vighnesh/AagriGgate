CREATE SEQUENCE IF NOT EXISTS farmer_sequence START WITH 10101 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS crop_sequence START WITH 10011 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS approach_sequence START WITH 1000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS favorite_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS cart_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS farmer (
    farmer_id BIGINT NOT NULL DEFAULT nextval('farmer_sequence'),
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
);

CREATE TABLE IF NOT EXISTS crop (
    crop_id BIGINT NOT NULL DEFAULT nextval('crop_sequence'),
    crop_name VARCHAR(255),
    crop_type VARCHAR(255),
    region VARCHAR(255),
    market_price DOUBLE PRECISION,
    quantity DOUBLE PRECISION,
    image_name VARCHAR(255),
    image_type VARCHAR(255),
    unit VARCHAR(255),
    description VARCHAR(255),
    is_urgent BOOLEAN,
    is_waste BOOLEAN,
    discount_price DOUBLE PRECISION,
    status VARCHAR(255),
    image_data BYTEA,
    farmer_id BIGINT NOT NULL,
    post_date VARCHAR(255),
    PRIMARY KEY (crop_id),
    CONSTRAINT fk_crop_farmer FOREIGN KEY (farmer_id) REFERENCES farmer (farmer_id)
);

CREATE TABLE IF NOT EXISTS approach_farmer (
    approach_id BIGINT NOT NULL DEFAULT nextval('approach_sequence'),
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
    requested_quantity DOUBLE PRECISION,
    accept BOOLEAN,
    status VARCHAR(255),
    PRIMARY KEY (approach_id)
);

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT NOT NULL DEFAULT nextval('favorite_sequence'),
    buyer_id BIGINT,
    crop_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_favorites_buyer_crop UNIQUE (buyer_id, crop_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT NOT NULL DEFAULT nextval('cart_sequence'),
    buyer_id BIGINT,
    crop_id BIGINT,
    quantity DOUBLE PRECISION,
    created_at TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_cart_items_buyer_crop UNIQUE (buyer_id, crop_id)
);

CREATE TABLE IF NOT EXISTS saved_market_data (
    id BIGSERIAL PRIMARY KEY,
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
    variety VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS verification_token (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255),
    farmer_id BIGINT NOT NULL UNIQUE,
    expiry_date TIMESTAMP,
    CONSTRAINT fk_verification_token_farmer FOREIGN KEY (farmer_id) REFERENCES farmer (farmer_id)
);

CREATE TABLE IF NOT EXISTS registration_otp (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    otp VARCHAR(255),
    expiry_time TIMESTAMP,
    verified BOOLEAN
);

CREATE TABLE IF NOT EXISTS password_reset_otp (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    otp VARCHAR(255),
    expiry_time TIMESTAMP,
    verified BOOLEAN
);

CREATE TABLE IF NOT EXISTS login_otp (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT,
    otp VARCHAR(255),
    expiry_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiry (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP
);
