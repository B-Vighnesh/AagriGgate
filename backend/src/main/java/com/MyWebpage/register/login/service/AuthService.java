package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.auth.AuthRequestDTO;
import com.MyWebpage.register.login.auth.AuthResponseDTO;
import com.MyWebpage.register.login.farmer.FarmerRequestDTO;
import com.MyWebpage.register.login.otp.OtpLoginRequestDTO;

public interface AuthService {

    AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role);

    AuthResponseDTO login(
            AuthRequestDTO dto);

    void sendLoginOtp(
            String principal);

    AuthResponseDTO loginWithOtp(
            OtpLoginRequestDTO dto);

    void changePassword(
            Long farmerId,
            String currentPassword,
            String newPassword);

    void deleteAccount(
            Long farmerId,
            String password);

}
