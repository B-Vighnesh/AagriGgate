package com.MyWebpage.register.login.approach;

public class ApproachStatusResponseDTO {
    private String status;
    private Long approachId;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getApproachId() {
        return approachId;
    }

    public void setApproachId(Long approachId) {
        this.approachId = approachId;
    }

    @Override
    public String toString() {
        return "[bkhsfebhjfsbhjfsfsd]ApproachStatusResponseDTO{" +
                "status='" + status + '\'' +
                ", approachId=" + approachId +
                '}';
    }

    public ApproachStatusResponseDTO() {
    }

    public ApproachStatusResponseDTO(String status, Long approachId) {
        this.status = status;
        this.approachId = approachId;
    }
}
