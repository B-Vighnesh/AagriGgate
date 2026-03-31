package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.ApiQuotaLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ApiQuotaLogRepository extends JpaRepository<ApiQuotaLog, ApiQuotaLog.ApiQuotaLogId> {

    Optional<ApiQuotaLog> findByLogDateAndApiName(LocalDate logDate, String apiName);

    void deleteByApiNameAndLogDateBefore(String apiName, LocalDate logDate);
}
