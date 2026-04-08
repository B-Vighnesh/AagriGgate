CREATE TABLE daily_crop_price_summary (
    id BIGSERIAL PRIMARY KEY,
    summary_date DATE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    avg_min_price NUMERIC(10,2),
    avg_max_price NUMERIC(10,2),
    avg_modal_price NUMERIC(10,2),
    market_count INT NOT NULL,
    record_count INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_crop_price_summary_identity UNIQUE (summary_date, state, district, commodity)
);

CREATE INDEX idx_daily_crop_price_summary_lookup
    ON daily_crop_price_summary (commodity, summary_date, state, district);

INSERT INTO daily_crop_price_summary (
    summary_date,
    state,
    district,
    commodity,
    avg_min_price,
    avg_max_price,
    avg_modal_price,
    market_count,
    record_count,
    created_at,
    updated_at
)
SELECT
    arrival_date,
    state,
    district,
    commodity,
    ROUND(AVG(min_price), 2),
    ROUND(AVG(max_price), 2),
    ROUND(AVG(modal_price), 2),
    COUNT(DISTINCT market),
    COUNT(*),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM market
GROUP BY arrival_date, state, district, commodity;
