package com.MyWebpage.register.login.otp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OtpLoginRequestDTO {

    @NotBlank
    @Size(min = 3, max = 100)
    private String principal;

    @NotBlank
    @Size(min = 4, max = 10)
    private String otp;

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
