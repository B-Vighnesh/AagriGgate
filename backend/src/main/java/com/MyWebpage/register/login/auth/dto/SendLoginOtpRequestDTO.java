package com.MyWebpage.register.login.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendLoginOtpRequestDTO {

    @NotBlank
    @Size(min = 3, max = 100)
    private String principal;

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }
}
