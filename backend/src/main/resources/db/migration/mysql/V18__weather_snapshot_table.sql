CREATE TABLE IF NOT EXISTS weather_snapshot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    state_name VARCHAR(120) NOT NULL,
    district_name VARCHAR(160) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    temperature_c DOUBLE NULL,
    feels_like_c DOUBLE NULL,
    wind_kph DOUBLE NULL,
    precip_mm DOUBLE NULL,
    humidity INT NULL,
    condition_text VARCHAR(160) NULL,
    condition_icon VARCHAR(255) NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_weather_snapshot_state_district UNIQUE (state_name, district_name)
);
