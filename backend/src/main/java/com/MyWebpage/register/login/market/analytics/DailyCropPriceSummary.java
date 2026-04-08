package com.MyWebpage.register.login.market.analytics;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_crop_price_summary")
public class DailyCropPriceSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String commodity;

    @Column(name = "avg_min_price", precision = 10, scale = 2)
    private BigDecimal avgMinPrice;

    @Column(name = "avg_max_price", precision = 10, scale = 2)
    private BigDecimal avgMaxPrice;

    @Column(name = "avg_modal_price", precision = 10, scale = 2)
    private BigDecimal avgModalPrice;

    @Column(name = "market_count", nullable = false)
    private Integer marketCount;

    @Column(name = "record_count", nullable = false)
    private Integer recordCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public LocalDate getSummaryDate() {
        return summaryDate;
    }

    public String getState() {
        return state;
    }

    public String getDistrict() {
        return district;
    }

    public String getCommodity() {
        return commodity;
    }

    public BigDecimal getAvgMinPrice() {
        return avgMinPrice;
    }

    public BigDecimal getAvgMaxPrice() {
        return avgMaxPrice;
    }

    public BigDecimal getAvgModalPrice() {
        return avgModalPrice;
    }

    public Integer getMarketCount() {
        return marketCount;
    }

    public Integer getRecordCount() {
        return recordCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
