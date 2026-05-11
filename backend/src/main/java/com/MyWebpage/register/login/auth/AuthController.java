package com.MyWebpage.register.login.auth;

import com.MyWebpage.register.login.auth.dto.*;
import com.MyWebpage.register.login.auth.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.passwordreset.ResetPasswordRequest;
import com.MyWebpage.register.login.common.EmailService;
import com.MyWebpage.register.login.otp.OtpPurpose;
import com.MyWebpage.register.login.otp.OtpService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Duration AUTH_COOKIE_TTL = Duration.ofDays(7);

    private final AuthService authService;
    private final EmailService emailService;
    private final OtpService otpService;

    @Value("${app.auth.cookie-secure:false}")
    private boolean secureAuthCookie;

    @PostMapping("/register/send-otp")
    public ResponseEntity<String> sendRegistrationOtp(@RequestBody FarmerRequestDTO dto) {
        authService.findUser(dto.getEmail());
        OtpPurpose registrationPurpose = resolveRegistrationPurpose(dto.getRole());
        String otp = otpService.issueOtp(dto.getEmail(), registrationPurpose);
        emailService.sendRegistrationOtpEmail(dto.getEmail(), dto.getFirstName(), dto.getUsername(), otp);
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<String> verifyRegistrationOtp(@RequestBody VerifyOtpRequestDTO dto) {
        boolean verified = otpService.verifyOtp(dto.getEmail(), resolveRegistrationPurpose(dto.getRole()), dto.getOtp());
        if (!verified) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        return ResponseEntity.ok("OTP verified");
    }

    @PostMapping("/register/seller")
    public ResponseEntity<Map<String, Object>> registerSeller(@Valid @RequestBody FarmerRequestDTO dto) {
        return ResponseEntity.ok(toSessionResponse(authService.register(dto, "SELLER")));
    }

    @PostMapping("/register/buyer")
    public ResponseEntity<Map<String, Object>> registerBuyer(@Valid @RequestBody FarmerRequestDTO dto) {
        return ResponseEntity.ok(toSessionResponse(authService.register(dto, "BUYER")));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody AuthRequestDTO dto,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.login(dto);
        addAuthCookie(response, authResponse.getToken(), AUTH_COOKIE_TTL);
        return ResponseEntity.ok(toSessionResponse(authResponse));
    }

    @PostMapping("/login/send-otp")
    public ResponseEntity<String> sendLoginOtp(@RequestBody SendLoginOtpRequestDTO dto) {
        authService.sendLoginOtp(dto.getPrincipal());
        return ResponseEntity.ok("Login OTP sent");
    }

    @PostMapping("/login/otp")
    public ResponseEntity<Map<String, Object>> loginWithOtp(
            @RequestBody OtpLoginRequestDTO dto,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.loginWithOtp(dto);
        addAuthCookie(response, authResponse.getToken(), AUTH_COOKIE_TTL);
        return ResponseEntity.ok(toSessionResponse(authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        Map<String, Object> response =authService.getUserDetails(farmerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        addAuthCookie(response, "", Duration.ZERO);
        return ResponseEntity.ok("Logged out");
    }

    @PostMapping("/delete-account/send-otp")
    public ResponseEntity<String> sendDeleteAccountOtp(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        authService.sendDeletionOtp(farmerId);
        return ResponseEntity.ok("Delete account OTP sent");
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
            @Valid @RequestBody DeleteAccountRequestDTO request) {
        Long farmerId = Long.parseLong(authentication.getName());
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role="";
        for (GrantedAuthority authority : authorities) {
             role= authority.getAuthority();
        }
        authService.softDeleteAccount(farmerId, request, role);
        return ResponseEntity.ok("Account deleted");
    }

    @Deprecated
    @PostMapping("/deactivate-account")
    public ResponseEntity<String> deactivateAccount(
            Authentication authentication,
            @RequestBody ResetPasswordRequest request) {
        Long farmerId = Long.parseLong(authentication.getName());
        authService.softDeleteAccount(farmerId, request.getCurrentPassword());
        return ResponseEntity.ok("Account deactivated");
    }

    private OtpPurpose resolveRegistrationPurpose(String role) {
        if ("buyer".equalsIgnoreCase(role) || "BUYER".equalsIgnoreCase(role)) {
            return OtpPurpose.BUYER_REGISTRATION;
        }
        return OtpPurpose.SELLER_REGISTRATION;
    }

    private void addAuthCookie(HttpServletResponse response, String token, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(secureAuthCookie)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private Map<String, Object> toSessionResponse(AuthResponseDTO authResponse) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("role", authResponse.getRole());
        response.put("farmerId", authResponse.getFarmerId());
        response.put("firstName", authResponse.getFirstName());
        return response;
    }
}
