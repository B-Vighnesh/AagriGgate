package com.MyWebpage.register.login.news.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "api_quota_log")
@IdClass(ApiQuotaLog.ApiQuotaLogId.class)
public class ApiQuotaLog {

    @Id
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Id
    @Column(name = "api_name", nullable = false, length = 100)
    private String apiName;

    @Column(name = "call_count", nullable = false)
    private int callCount;

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public int getCallCount() {
        return callCount;
    }

    public void setCallCount(int callCount) {
        this.callCount = callCount;
    }

    public static class ApiQuotaLogId implements Serializable {

        private LocalDate logDate;
        private String apiName;

        public ApiQuotaLogId() {
        }

        public ApiQuotaLogId(LocalDate logDate, String apiName) {
            this.logDate = logDate;
            this.apiName = apiName;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ApiQuotaLogId that)) {
                return false;
            }
            return Objects.equals(logDate, that.logDate) && Objects.equals(apiName, that.apiName);
        }

        @Override
        public int hashCode() {
            return Objects.hash(logDate, apiName);
        }
    }
}
