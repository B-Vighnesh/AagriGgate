package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.entity.ApiQuotaLog;
import com.MyWebpage.register.login.news.repository.ApiQuotaLogRepository;
import com.MyWebpage.register.login.news.util.NewsTime;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ApiQuotaLogService {

    private static final String GNEWS_API_NAME = "gnews";

    private final ApiQuotaLogRepository apiQuotaLogRepository;

    public ApiQuotaLogService(ApiQuotaLogRepository apiQuotaLogRepository, MeterRegistry meterRegistry) {
        this.apiQuotaLogRepository = apiQuotaLogRepository;
        meterRegistry.gauge("news.gnews.quota.calls.today", this, ApiQuotaLogService::getTodayGnewsCallCount);
    }

    @Transactional
    public boolean tryConsumeGnewsCall(int limit) {
        LocalDate today = LocalDate.now(NewsTime.IST);
        ApiQuotaLog quotaLog = apiQuotaLogRepository.findByLogDateAndApiName(today, GNEWS_API_NAME)
                .orElseGet(() -> newQuotaLog(today, GNEWS_API_NAME));

        if (quotaLog.getCallCount() >= limit) {
            return false;
        }

        quotaLog.setCallCount(quotaLog.getCallCount() + 1);
        apiQuotaLogRepository.save(quotaLog);
        return true;
    }

    @Transactional(readOnly = true)
    public int getTodayGnewsCallCount() {
        return apiQuotaLogRepository.findByLogDateAndApiName(LocalDate.now(NewsTime.IST), GNEWS_API_NAME)
                .map(ApiQuotaLog::getCallCount)
                .orElse(0);
    }

    @Transactional
    public void resetDailyQuota(String apiName) {
        LocalDate today = LocalDate.now(NewsTime.IST);
        apiQuotaLogRepository.deleteByApiNameAndLogDateBefore(apiName, today);

        ApiQuotaLog quotaLog = apiQuotaLogRepository.findByLogDateAndApiName(today, apiName)
                .orElseGet(() -> newQuotaLog(today, apiName));
        quotaLog.setCallCount(0);
        apiQuotaLogRepository.save(quotaLog);
    }

    private ApiQuotaLog newQuotaLog(LocalDate today, String apiName) {
        ApiQuotaLog quotaLog = new ApiQuotaLog();
        quotaLog.setLogDate(today);
        quotaLog.setApiName(apiName);
        quotaLog.setCallCount(0);
        return quotaLog;
    }
}
