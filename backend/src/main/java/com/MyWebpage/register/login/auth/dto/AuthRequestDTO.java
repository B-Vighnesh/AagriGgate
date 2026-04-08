package com.MyWebpage.register.login.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequestDTO {
    @NotBlank
    @Size(min = 3, max = 100)
    private String principal;
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    public String getPrincipal() { return principal; }
    public void setPrincipal(String principal) { this.principal = principal; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
