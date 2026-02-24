package com.MyWebpage.register.login.service;

public interface PasswordResetService {

    void sendOtp(String email);

    void verifyOtp(String email, String otp);

    void resetPassword(String email, String newPassword);
}
