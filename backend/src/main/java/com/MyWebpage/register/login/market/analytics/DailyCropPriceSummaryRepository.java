package com.MyWebpage.register.login.market.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyCropPriceSummaryRepository extends JpaRepository<DailyCropPriceSummary, Long>, DailyCropPriceSummaryRefreshRepository {

    @Query("""
            select d from DailyCropPriceSummary d
            where lower(d.commodity) = lower(:commodity)
              and lower(d.state) = lower(:state)
              and (:district is null or lower(d.district) = lower(:district))
              and d.summaryDate between :fromDate and :toDate
            order by d.summaryDate asc, d.district asc
            """)
    List<DailyCropPriceSummary> findSeries(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("district") String district,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
            select d from DailyCropPriceSummary d
            where lower(d.commodity) = lower(:commodity)
              and lower(d.state) = lower(:state)
              and d.summaryDate = :summaryDate
            order by d.district asc
            """)
    List<DailyCropPriceSummary> findHeatmapRows(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("summaryDate") LocalDate summaryDate
    );

    @Query("select max(d.summaryDate) from DailyCropPriceSummary d")
    Optional<LocalDate> findLatestSummaryDate();
}
