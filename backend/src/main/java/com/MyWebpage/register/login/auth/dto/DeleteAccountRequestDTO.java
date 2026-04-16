package com.MyWebpage.register.login.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequestDTO {
    @NotBlank
    private String otp;
    @NotBlank
    private String password;

    public DeleteAccountRequestDTO() {
    }

    public DeleteAccountRequestDTO(String otp, String password) {
        this.otp = otp;
        this.password = password;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
