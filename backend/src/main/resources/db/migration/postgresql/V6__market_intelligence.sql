CREATE TABLE IF NOT EXISTS market (
    id BIGSERIAL PRIMARY KEY,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    market VARCHAR(150) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    commodity_code VARCHAR(50),
    variety VARCHAR(100) NOT NULL DEFAULT '',
    grade VARCHAR(50) NOT NULL DEFAULT '',
    arrival_date DATE NOT NULL,
    min_price NUMERIC(10,2),
    max_price NUMERIC(10,2),
    modal_price NUMERIC(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_market_identity
    ON market (state, district, market, commodity, variety, grade, arrival_date);

CREATE INDEX IF NOT EXISTS idx_market_search
    ON market (commodity, arrival_date DESC, state, district);

CREATE TABLE IF NOT EXISTS saved_market (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    market_id BIGINT NOT NULL REFERENCES market (id) ON DELETE CASCADE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(500),
    CONSTRAINT uk_saved_market_user_market UNIQUE (user_id, market_id)
);
