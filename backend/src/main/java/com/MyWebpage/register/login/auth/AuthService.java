package com.MyWebpage.register.login.auth;

import com.MyWebpage.register.login.auth.dto.AuthRequestDTO;
import com.MyWebpage.register.login.auth.dto.AuthResponseDTO;
import com.MyWebpage.register.login.auth.dto.OtpLoginRequestDTO;
import com.MyWebpage.register.login.farmer.FarmerRequestDTO;

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

    void softDeleteAccount(
            Long farmerId,
            String password);

    @Deprecated
    void deleteAccount(
            Long farmerId,
            String password, String role);

    void softDeleteAccount(Long farmerId, String password, String role);

    void findUser(String email);
}
