package com.MyWebpage.register.login.market;

import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Locale;

@Repository
public class MarketBatchRepositoryImpl implements MarketBatchRepository {

    private final JdbcTemplate jdbcTemplate;
    private volatile String insertSql;

    public MarketBatchRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void batchInsertIgnore(List<Market> markets) {
        if (markets == null || markets.isEmpty()) {
            return;
        }

        jdbcTemplate.batchUpdate(resolveInsertSql(), new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Market market = markets.get(i);
                ps.setString(1, market.getState());
                ps.setString(2, market.getDistrict());
                ps.setString(3, market.getMarketName());
                ps.setString(4, market.getCommodity());
                if (market.getCommodityCode() == null) {
                    ps.setNull(5, Types.VARCHAR);
                } else {
                    ps.setString(5, market.getCommodityCode());
                }
                ps.setString(6, market.getVariety());
                ps.setString(7, market.getGrade());
                ps.setObject(8, market.getArrivalDate());
                ps.setBigDecimal(9, market.getMinPrice());
                ps.setBigDecimal(10, market.getMaxPrice());
                ps.setBigDecimal(11, market.getModalPrice());
                ps.setTimestamp(12, Timestamp.valueOf(market.getCreatedAt()));
            }

            @Override
            public int getBatchSize() {
                return markets.size();
            }
        });
    }

    private String resolveInsertSql() {
        if (insertSql != null) {
            return insertSql;
        }

        synchronized (this) {
            if (insertSql != null) {
                return insertSql;
            }

            String productName = databaseProductName();
            insertSql = switch (productName) {
                case "postgresql" -> """
                        INSERT INTO market (
                            state, district, market, commodity, commodity_code, variety, grade,
                            arrival_date, min_price, max_price, modal_price, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT (state, district, market, commodity, variety, grade, arrival_date) DO NOTHING
                        """;
                case "mysql", "mariadb" -> """
                        INSERT IGNORE INTO market (
                            state, district, market, commodity, commodity_code, variety, grade,
                            arrival_date, min_price, max_price, modal_price, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """;
                default -> throw new IllegalStateException("Unsupported database for market ingestion: " + productName);
            };

            return insertSql;
        }
    }

    private String databaseProductName() {
        DataSource dataSource = jdbcTemplate.getDataSource();
        if (dataSource == null) {
            throw new IllegalStateException("JdbcTemplate data source is not configured");
        }

        try (Connection connection = dataSource.getConnection()) {
            return connection.getMetaData().getDatabaseProductName().toLowerCase(Locale.ROOT);
        } catch (SQLException exception) {
            throw new IllegalStateException("Unable to detect database product for market ingestion", exception);
        }
    }
}
