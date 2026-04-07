package com.MyWebpage.register.login.passwordreset;

import com.MyWebpage.register.login.auth.dto.VerifyOtpRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO dto) {
        passwordResetService.sendOtp(dto.getEmail());
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequestDTO dto) {
        passwordResetService.verifyOtp(dto.getEmail(), dto.getOtp());
        return ResponseEntity.ok("OTP verified");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO dto) {
        passwordResetService.resetPassword(dto.getEmail(), dto.getNewPassword());
        return ResponseEntity.ok("Password reset successful");
    }
}
