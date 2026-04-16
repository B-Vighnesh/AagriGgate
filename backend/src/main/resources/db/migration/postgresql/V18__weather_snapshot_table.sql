CREATE TABLE IF NOT EXISTS weather_snapshot (
    id BIGSERIAL PRIMARY KEY,
    state_name VARCHAR(120) NOT NULL,
    district_name VARCHAR(160) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature_c DOUBLE PRECISION NULL,
    feels_like_c DOUBLE PRECISION NULL,
    wind_kph DOUBLE PRECISION NULL,
    precip_mm DOUBLE PRECISION NULL,
    humidity INT NULL,
    condition_text VARCHAR(160) NULL,
    condition_icon VARCHAR(255) NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_weather_snapshot_state_district UNIQUE (state_name, district_name)
);
