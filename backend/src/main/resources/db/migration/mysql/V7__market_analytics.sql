CREATE TABLE daily_crop_price_summary (
    id BIGINT NOT NULL AUTO_INCREMENT,
    summary_date DATE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    avg_min_price DECIMAL(10,2),
    avg_max_price DECIMAL(10,2),
    avg_modal_price DECIMAL(10,2),
    market_count INT NOT NULL,
    record_count INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uq_daily_crop_price_summary_identity UNIQUE (summary_date, state, district, commodity)
) ENGINE=InnoDB;

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
    NOW(6),
    NOW(6)
FROM market
GROUP BY arrival_date, state, district, commodity;
