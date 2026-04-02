CREATE TABLE IF NOT EXISTS market (
    id BIGINT NOT NULL AUTO_INCREMENT,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    market VARCHAR(150) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    commodity_code VARCHAR(50),
    variety VARCHAR(100) NOT NULL DEFAULT '',
    grade VARCHAR(50) NOT NULL DEFAULT '',
    arrival_date DATE NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    modal_price DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE UNIQUE INDEX uq_market_identity
    ON market (state, district, market, commodity, variety, grade, arrival_date);

CREATE INDEX idx_market_search
    ON market (commodity, arrival_date DESC, state, district);

CREATE TABLE IF NOT EXISTS saved_market (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    market_id BIGINT NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_saved_market_market FOREIGN KEY (market_id) REFERENCES market (id) ON DELETE CASCADE,
    CONSTRAINT uk_saved_market_user_market UNIQUE (user_id, market_id)
) ENGINE=InnoDB;
