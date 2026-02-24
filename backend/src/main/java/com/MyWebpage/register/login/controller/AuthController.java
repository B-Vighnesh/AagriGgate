package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/seller")
    public AuthResponseDTO registerSeller(@RequestBody FarmerRequestDTO dto) {
        return authService.register(dto, "SELLER");
    }

    @PostMapping("/register/buyer")
    public AuthResponseDTO registerBuyer(@RequestBody FarmerRequestDTO dto) {
        return authService.register(dto, "BUYER");
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody AuthRequestDTO dto) {
        return authService.login(dto);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @RequestBody ResetPasswordRequest request) {
        Long farmerId = Long.parseLong(authentication.getName());
        authService.changePassword(farmerId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed");
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<String> deleteAccount(
            Authentication authentication,
            @RequestBody ResetPasswordRequest request) {
        Long farmerId = Long.parseLong(authentication.getName());
        authService.deleteAccount(farmerId, request.getCurrentPassword());
        return ResponseEntity.ok("Account deleted");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok("Password reset");
    }
}
