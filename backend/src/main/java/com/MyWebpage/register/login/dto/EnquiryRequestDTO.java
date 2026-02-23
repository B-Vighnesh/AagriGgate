package com.MyWebpage.register.login.dto;

import jakarta.validation.constraints.NotBlank;

public class EnquiryRequestDTO {
    @NotBlank
    private String message;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
