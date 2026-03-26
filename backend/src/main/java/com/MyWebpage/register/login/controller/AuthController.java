package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.dto.VerifyOtpRequestDTO;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.service.AuthService;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.OtpService;
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
    private final EmailService emailService;
    private final OtpService otpService;

    @PostMapping("/register/send-otp")
    public ResponseEntity<String> sendRegistrationOtp(@RequestBody FarmerRequestDTO dto) {
        int otp = emailService.sendRegistrationOtpEmail(dto.getEmail(), dto.getFirstName(), dto.getUsername());
        otpService.storeOtp(dto.getEmail(), otp);
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<String> verifyRegistrationOtp(@RequestBody VerifyOtpRequestDTO dto) {
        int otpValue;
        try {
            otpValue = Integer.parseInt(dto.getOtp());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid OTP format");
        }

        boolean verified = otpService.verifyOtp(dto.getEmail(), otpValue);
        if (!verified) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        return ResponseEntity.ok("OTP verified");
    }

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
}
