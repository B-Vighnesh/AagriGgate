package com.MyWebpage.register.login.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequestDTO {
    @NotBlank
    private String principal;
    @NotBlank
    private String password;

    public String getPrincipal() { return principal; }
    public void setPrincipal(String principal) { this.principal = principal; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
