package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import com.MyWebpage.register.login.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final EmailService emailService;
    private final OtpService otpService;
    private final FarmerService farmerService;
    private final AuthService authService;
    public AuthController(EmailService emailService, OtpService otpService, FarmerService farmerService) {
        this.emailService = emailService;
        this.otpService = otpService;
        this.farmerService = farmerService;
    }
    @PostMapping("/register/seller")
    public ResponseEntity<AuthResponseDTO> registerSeller(
            @RequestBody FarmerRequestDTO dto) {

        return ResponseEntity.ok(
                authService.register(dto, "SELLER"));
    }

    @PostMapping("/register/buyer")
    public ResponseEntity<AuthResponseDTO> registerBuyer(
            @RequestBody FarmerRequestDTO dto) {

        return ResponseEntity.ok(
                authService.register(dto, "BUYER"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @RequestBody AuthRequestDTO dto) {

        return ResponseEntity.ok(
                authService.login(dto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordDTO dto) {

        Long farmerId =
                Long.parseLong(authentication.getName());

        authService.changePassword(
                farmerId,
                dto);

        return ResponseEntity.ok("Password changed");
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<String> deleteAccount(
            Authentication authentication,
            @RequestBody DeleteAccountDTO dto) {

        Long farmerId =
                Long.parseLong(authentication.getName());

        authService.deleteAccount(
                farmerId,
                dto.getPassword());

        return ResponseEntity.ok("Account deleted");
    }
    @GetMapping("/isTokenValid")
    public ResponseEntity<Boolean> isTokenValid() {
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @PostMapping("/reset-otp/{principal}")
    public ResponseEntity<String> send2Otp(@PathVariable String principal) {
        try {
            Farmer foundFarmer = principal.contains("@")
                    ? farmerService.findByEmail(principal)
                    : farmerService.findByUsername(principal);
            String email = foundFarmer.getEmail();
            int otp = emailService.sendVerificationEmail(email);
            otpService.storeOtp(email, otp);
            return new ResponseEntity<>(email, HttpStatus.OK);
        } catch (MailSendException e) {
            return new ResponseEntity<>("server busy", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("not found", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/send-otp/{email}")
    public ResponseEntity<Map<String, Object>> send1Otp(@PathVariable String email) {
        try {
            int otp = emailService.sendVerificationEmail1(email);
            otpService.storeOtp(email, otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to email!");
            response.put("success", true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "not found");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestParam String email, @RequestParam int otp) {
        Map<String, Object> response = new HashMap<>();
        if (otpService.verifyOtp(email, otp)) {
            otpService.clearOtp(email);
            otpService.setOtpVerifiedMap(email, true);
            response.put("message", "OTP verified successfully!");
            response.put("success", true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("message", "Invalid OTP!");
        response.put("success", false);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
