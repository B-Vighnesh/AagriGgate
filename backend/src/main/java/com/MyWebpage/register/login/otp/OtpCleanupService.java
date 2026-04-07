package com.MyWebpage.register.login.otp;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpCleanupService {

    private final OtpTokenRepository otpTokenRepository;

    // Universal OTP cleanup for registration, login, and password-reset tokens.
    @Scheduled(cron = "${otp.cleanup-cron}")
    @Transactional
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpTokenRepository.deleteByExpiresAtBefore(now);
    }
}
