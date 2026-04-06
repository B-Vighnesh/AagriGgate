package com.MyWebpage.register.login.market.analytics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public class DailyCropPriceSummaryRefreshRepositoryImpl implements DailyCropPriceSummaryRefreshRepository {

    private static final String DELETE_SQL = """
            DELETE FROM daily_crop_price_summary
            WHERE summary_date = ? AND state = ? AND district = ?
            """;

    private static final String INSERT_SQL = """
            INSERT INTO daily_crop_price_summary (
                summary_date, state, district, commodity, avg_min_price, avg_max_price, avg_modal_price,
                market_count, record_count, created_at, updated_at
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
                ?,
                ?
            FROM market
            WHERE state = ? AND district = ? AND arrival_date = ?
            GROUP BY arrival_date, state, district, commodity
            """;

    private final JdbcTemplate jdbcTemplate;

    public DailyCropPriceSummaryRefreshRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public int refreshForDistrictDate(String state, String district, LocalDate date) {
        jdbcTemplate.update(DELETE_SQL, date, state, district);
        LocalDateTime now = LocalDateTime.now();
        return jdbcTemplate.update(
                INSERT_SQL,
                Timestamp.valueOf(now),
                Timestamp.valueOf(now),
                state,
                district,
                date
        );
    }
}
