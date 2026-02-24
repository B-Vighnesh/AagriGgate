package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;

public interface AuthService {

    AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role);

    AuthResponseDTO login(
            AuthRequestDTO dto);

    void changePassword(
            Long farmerId,
            ChangePasswordDTO dto);

    void deleteAccount(
            Long farmerId,
            String password);

}