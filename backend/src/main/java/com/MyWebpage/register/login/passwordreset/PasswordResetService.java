package com.MyWebpage.register.login.passwordreset;

public interface PasswordResetService {

    void sendOtp(String email);

    void verifyOtp(String email, String otp);

    void resetPassword(String email, String newPassword);
}
